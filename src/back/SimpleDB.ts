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

  constructor () {
    this.directory = 'simpleDB/';
    if (!existsSync(this.directory)) {
      mkdirSync(this.directory);
    }
    this.db = Sqlite3(path.join(this.directory, 'db.db'));
  }

  getFilePath (file: z.infer<typeof STFFile>) {
    return path.join(this.directory, `${file.entryId}-${file.id}`);
  }

  async init () {
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
      return STFEntry.parse(result);
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
}

export default SimpleDB;
