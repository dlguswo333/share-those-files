/**
 * All global types are defined here.
 * For runtime type safety, use zod.
 */
import {Stream} from 'node:stream';
import {z} from 'zod';

export const NonEmptyString = z.string().nonempty();

export const STFFile = z.object({
  id: NonEmptyString,
  entryId: NonEmptyString,
  name: NonEmptyString,
  size: z.number().nonnegative().finite().int(),
  // numChunks: z.number().nonnegative().finite().int(),
});
export const STFFileFromClient = STFFile.extend({
  chunk: z.string().base64(),
  chunkInd: z.number().nonnegative().finite().int(),
}).partial({
  id: true,
});

export const STFEntry = z.object({
  id: NonEmptyString,
  length: z.number().nonnegative().finite().int(),
  uploadDate: z.string().datetime(),
  deleteDate: z.string().datetime(),
  // files: z.array(STFFile),
});
export const STFEntryFromClient = STFEntry.omit({
  id: true,
  uploadDate: true
});

export const IdObject = z.object({
  id: NonEmptyString,
});

export type DB = {
  init: () => Promise<unknown>,
  setEntry: (entry: z.infer<typeof STFEntry>) => Promise<string | null>,
  setFile: (entry: z.infer<typeof STFFile>) => Promise<string | null>,
  setFileChunk: (file: z.infer<typeof STFFile>, chunkInd: number, chunk: Blob) => Promise<boolean>,
  getEntryById: (id: string) => Promise<z.infer<typeof STFEntry> | null>,
  getFileById: (id: string) => Promise<z.infer<typeof STFFile> | null>,
  getFileIdsByEntryId: (id: string) => Promise<string[] | null>,
  getFileStream?: (file: z.infer<typeof STFFile>) => Promise<Stream | null>,
  getFileChunk?: (file: z.infer<typeof STFFile>, chunkInd: number) => Promise<Blob | null>,
  // [TODO] deleteEntry: (entry: z.infer<typeof STFEntry>) => Promise<boolean>,
};
