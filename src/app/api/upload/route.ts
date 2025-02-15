/**
 * Take care of upload apis.
 * 1. Accept upload request entry.
 * 2. Accept upload files linked to an upload entry.
 */
import {z} from 'zod';
import {STFEntryFromClient, STFFileFromClient, DB, STFFile} from '@/types';
import IndexDB from '@/back/IndexDB';
import {Buffer} from 'node:buffer';
import {randomUUID} from 'node:crypto';

const db: DB = new IndexDB();
await db.init();

/**
 * This function always returns `true`, without throwing errors.
 * This is because it is expected to work in ideal conditions.
 * Implement the logics if necessary.
 */
const checkPermission = () => {
  return true;
};
/**
 * This function always returns `true`, without throwing errors.
 * This is because it is expected to work in ideal conditions.
 * Implement the logics if necessary.
 */
const checkDiskUsage = () => {
  return true;
};

/**
 * It checks the date to delete then entry.
 * It does not strictly check; rather it rule out outliar dates.
 */
const checkDeleteDate = (entry: z.infer<typeof STFEntryFromClient>) => {
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);
  z.date().min(minDate).max(maxDate).parse(new Date(entry.deleteDate));
};

const handleUploadEntryRequest = async (_: Request, entry: z.infer<typeof STFEntryFromClient>) => {
  checkPermission();
  checkDiskUsage();
  checkDeleteDate(entry);
  const id = randomUUID();
  await db.setEntry({...entry, id, uploadDate: new Date().toISOString()});
  return new Response(JSON.stringify({id}), {status: 200});
};

const handleUploadFileRequest = async (_: Request, fileWithChunk: z.infer<typeof STFFileFromClient>) => {
  checkPermission();
  checkDiskUsage();
  const entry = await db.getEntryById(fileWithChunk.entryId);
  if (entry === null) {
    throw new Error('Could not find corresponding entry');
  }
  const fileWithChunkCopy = {...fileWithChunk};
  const fileDoesNotExistYet = !fileWithChunk.id;
  if (fileDoesNotExistYet) {
    const fileId = randomUUID();
    fileWithChunkCopy.id = fileId;
  }
  const {chunk, chunkInd} = fileWithChunk;
  const stfFile = STFFile.parse(fileWithChunkCopy);
  if (fileDoesNotExistYet) {
    if ((await db.setFile(stfFile)) === null) {
      throw new Error('handleUploadFileRequest error');
    }
  }

  const buffer = Buffer.from(chunk, 'base64');
  const blob = new Blob([buffer]);
  await db.setFileChunk(stfFile, chunkInd, blob);
  return new Response(JSON.stringify({id: stfFile.id}), {status: 200});
};

export async function POST (req: Request) {
  try {
    const payload = await req.json();
    if (STFEntryFromClient.safeParse(payload).success) {
      return handleUploadEntryRequest(req, payload);
    }
    if (STFFileFromClient.safeParse(payload).success) {
      return handleUploadFileRequest(req, payload);
    }
    console.error(payload);
    throw new Error('Unexpected payload');
  } catch (e) {
    console.error('upload api error');
    console.error(e);
    return new Response('Invalid request', {
      status: 400
    });
  }
}
