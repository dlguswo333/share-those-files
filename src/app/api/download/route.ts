import {DB} from '@/types';
import SimpleDb from '@/back/SimpleDB';
import PromisifiedZipStream from '@/back/PromisifiedZipStream';

const db: DB = new SimpleDb();
await db.init();

const getZipStreamWithEntries = (fileIds: string[]/** pZipStream: PromisifiedZipStream */) => {
  const pZipStream = new PromisifiedZipStream();
  // Asynchronously add entries to the zip stream.
  // This ensures that the data are added incrementally without waiting until the end.
  (async () => {
    const rawZipStream = pZipStream.getZipStream();
    for (const fileId of fileIds) {
      const file = await db.getFileById(fileId);
      if (file === null) {
        rawZipStream.finish();
        throw new Error('Cannot find file');
      };
      const fileStream = await db.getFileStream?.(file);
      if (fileStream === null || fileStream === undefined) {
        rawZipStream.finish();
        throw new Error('Cannot get file stream');
      };
      await pZipStream.entry(fileStream, {name: file.name});
      fileStream.close();
    }
    pZipStream.finalize();
  })();
  return pZipStream;
};

const handleDownloadEntryRequest = async (req: Request) => {
  const url = new URL(req.url);
  const entryId = url.searchParams.get('entryId');
  if (entryId === null) {
    throw new Error('entryId is null');
  };
  const entry = await db.getEntryById(entryId);
  if (entry === null) {
    throw new Error('Cannot find entry');
  };
  const fileIds = await db.getFileIdsByEntryId(entryId);
  if (fileIds === null) {
    throw new Error('Cannot find fileId');
  };

  const pZipStream = getZipStreamWithEntries(fileIds);
  const rawZipStream = pZipStream.getZipStream();

  // [TODO] How may I handle errors while streaming...?
  const res = new Response(new ReadableStream({
    async pull (controller) {
      try {
        const iter = rawZipStream.iterator();
        while (true) {
          const value = await iter.next();
          if (value.done) {
            controller.close();
            break;
          }
          controller.enqueue(value.value);
        }
      } catch (e) {
        controller.error(e);
      }
    },
  }), {
    headers: {
      'Content-Disposition': 'attachment; filename="share-those-files.zip"',
    }
  });
  return res;
};

export async function GET (req: Request) {
  try {
    return handleDownloadEntryRequest(req);
  } catch (e) {
    console.error('download api error');
    console.error(e);
    return new Response('Invalid request', {
      status: 400
    });
  }
}
