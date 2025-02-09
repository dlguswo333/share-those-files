import {DB, NonEmptyString, STFEntry, STFFile} from '@/types';
import {z} from 'zod';
import Sqlite3 from 'better-sqlite3';
import fs from 'node:fs/promises';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';

/**
 * As name suggests, this is a naively implemented DB for storing entries and files.
 * Entries and files are stored using sqlite3.
 * File chunks are stored as native files.
 *
 * Caution: This will only work on single threaded runtime environment.
 */
class SimpleDB implements DB {
  db: Sqlite3.Database;
  directory: string;
  initialized = false;

  constructor () {
    this.directory = 'db/simpleDB/';
    if (!existsSync(this.directory)) {
      mkdirSync(this.directory, {recursive: true});
    }
    this.db = Sqlite3(path.join(this.directory, 'db.db'));
  }

  private getFilePath (file: Pick<z.infer<typeof STFFile>, 'id' | 'entryId'>) {
    return path.join(this.directory, `${file.entryId}-${file.id}`);
  }

  async init () {
    if (this.initialized) {
      return;
    }
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    const entryTableCreateStmt = this.db.prepare(`
      CREATE TABLE IF NOT EXISTS entry (
      id TEXT PRIMARY KEY NOT NULL,
      length INTEGER NOT NULL DEFAULT 0,
      uploadDate TEXT NOT NULL,
      deleteDate TEXT NOT NULL
      )
    `);
    const fileTableCreateStmt = this.db.prepare(`
      CREATE TABLE IF NOT EXISTS file (
      id TEXT PRIMARY KEY NOT NULL,
      entryId TEXT NOT NULL,
      name TEXT NOT NULL,
      size INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(entryId) REFERENCES entry(id)
      )
    `);

    entryTableCreateStmt.run();
    fileTableCreateStmt.run();

    const oneHour = 1000 * 60 * 60;
    const INTERVAL = oneHour;
    const cleanup = () => {
      setTimeout(() => {
        this.handleObsoleteEntries();
        cleanup();
      }, INTERVAL);
    };

    cleanup();
  };

  async setEntry (entry: z.infer<typeof STFEntry>) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO entry(id, length, uploadDate, deleteDate)
        VALUES(@id, @length, @uploadDate, @deleteDate)
      `);
      stmt.run({
        id: entry.id,
        length: entry.length,
        uploadDate: entry.uploadDate,
        deleteDate: entry.deleteDate,
      });
      return entry.id;
    } catch (e) {
      console.error('setEntry error');
      console.error(e);
      return null;
    }
  };

  async setFile (file: z.infer<typeof STFFile>) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO file(id, entryId, name, size)
        VALUES(@id, @entryId, @name, @size)
      `);
      stmt.run({
        id: file.id,
        entryId: file.entryId,
        name: file.name,
        size: file.size,
      });
      return file.id;
    } catch (e) {
      console.error('setFile error');
      console.error(e);
      return null;
    }
  };

  async setFileChunk (file: z.infer<typeof STFFile>, _: number, blob: Blob) {
    try {
      const filePath = this.getFilePath(file);
      await fs.appendFile(filePath, new Uint8Array(await blob.arrayBuffer()));
      return true;
    } catch (e) {
      console.error('setFileChunk error');
      console.error(e);
      return false;
    }
  };

  async getEntryById (id: string) {
    try {
      const stmt = this.db.prepare<[string]>(`
        SELECT * FROM entry WHERE id=?
      `);
      const result = stmt.get(id);
      const entry = STFEntry.parse(result);
      const isEntryToBeDeleted = new Date().toISOString() >= entry.deleteDate;
      if (isEntryToBeDeleted) {
        return null;
      }
      return entry;
    } catch (e) {
      console.error('getEntryById error');
      console.error(e);
      return null;
    }
  };

  async getFileIdsByEntryId (entryId: string) {
    try {
      const stmt = this.db.prepare<[string], {id: string}>(`
        SELECT id FROM file WHERE entryId=?
      `);
      const result = stmt.all(entryId).map(({id}) => id);
      return NonEmptyString.array().parse(result);
    } catch (e) {
      console.error('getFileIdsByEntryId error');
      console.error(e);
      return null;
    }
  };

  async getFileById (id: string) {
    try {
      const stmt = this.db.prepare<[string]>(`
        SELECT * FROM file WHERE id=?
      `);
      const result = stmt.get(id);
      return STFFile.parse(result);
    } catch (e) {
      console.error('getFileById error');
      console.error(e);
      return null;
    }
  };

  async getFileStream (file: z.infer<typeof STFFile>) {
    try {
      const filePath = this.getFilePath(file);
      const handle = fs.open(filePath);
      const stream = (await handle).createReadStream();
      return stream;
    } catch (e) {
      console.error('setFile error');
      console.error(e);
      return null;
    }
  }

  private getObsoleteEntryIds () {
    try {
      const curDate = new Date().toISOString();
      const stmt = this.db.prepare<string, {id: string}>(`
        SELECT id FROM entry WHERE deleteDate < ?
      `);
      const result = stmt.all(curDate).map(({id}) => id);
      return NonEmptyString.array().parse(result);
    } catch (e) {
      console.error('getObsoleteEntryIds error');
      console.error(e);
      return null;
    }
  }

  private removeFileById (id: string) {
    try {
      const stmt = this.db.prepare<string>(`
        DELETE FROM file WHERE id = ?
      `);
      const result = stmt.run(id);
      if (result.changes === 0) {
        throw new Error('No file with the id found');
      }
      return true;
    } catch (e) {
      console.error('removeFileById error');
      console.error(e);
      return false;
    }
  }

  /** This DB will not actually remove entries but files only for free disk. */
  async handleObsoleteEntries () {
    try {
      const entryIds = this.getObsoleteEntryIds();
      if (entryIds === null) {
        throw new Error('entryIds is null');
      }
      const removeObsoleteFilesPromises = entryIds.map(async entryId => {
        const fileIds = await this.getFileIdsByEntryId(entryId);
        if (fileIds === null) {
          return;
        }
        const removeFilesWithEntryId = fileIds.map(fileId => {
          this.removeFileById(fileId);
          return fs.rm(this.getFilePath({id: fileId, entryId}));
        });
        await Promise.all(removeFilesWithEntryId);
      });
      await Promise.all(removeObsoleteFilesPromises);
      return true;
    } catch (e) {
      console.error('removeObsoleteEntries error');
      console.error(e);
      return false;
    }
  }
}

export default SimpleDB;
