import {blobToBase64} from '@/util';
import {ChangeEvent, DragEvent, RefObject, useCallback, useEffect, useState} from 'react';
import {IdObject, NonEmptyString, STFEntryFromClient, STFFileFromClient} from '@/types';
import {z} from 'zod';

const excludeFolders = async (files: File[]) => {
  return (
    await Promise.all(files.map(async item => {
      try {
        await item.slice(0, 1).arrayBuffer();
        return item;
      } catch {
        return false;
      }
    }))
  ).filter(result => !!result);
};

const getStfFile = async (file: File, fileId: string, entryId: string, blob: Blob, chunkInd: number) => {
  const stfFile = {
    // Do not pass empty id; pass undefined instead.
    id: fileId || undefined,
    entryId,
    name: file.name,
    size: file.size,
    chunk: await blobToBase64(blob),
    chunkInd,
  } satisfies z.infer<typeof STFFileFromClient>;
  return stfFile;
};

type Props = {
  inputRef: RefObject<HTMLInputElement | null>;
}

type Status = 'idle' | 'okayToUpload' | 'uploading' | 'uploadError';

const useUpload = ({inputRef}: Props) => {
  const [status, setStatus] = useState<Status>('idle');
  const [files, setFiles] = useState<File[] | null>(null);

  const onDragOverEvent = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
  }, []);

  const onDropEvent = useCallback(async (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (status === 'uploading') {
      return;
    }
    const fileList = e.dataTransfer.files;

    const filesExcludingFolders = await excludeFolders([...fileList]);
    setFiles(filesExcludingFolders);
    if (inputRef.current) {
      inputRef.current.files = fileList;
    }
  }, [inputRef, status]);

  const onChangeEvent = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    if (status === 'uploading') {
      return;
    }
    const fileList = e.target.files;
    if (!fileList) {
      return;
    }
    const filesExcludingFolders = await excludeFolders([...fileList]);
    setFiles(filesExcludingFolders);
  }, [status]);

  const clickInputElement = useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);

  const upload = useCallback(async () => {
    try {
      setStatus('uploading');
      if (files === null) {
        return;
      }
      const deleteDate = new Date();
      // [TODO] Allow users to customize it.
      deleteDate.setDate(deleteDate.getDate() + 3);
      const entry = {
        length: files.length,
        deleteDate: deleteDate.toISOString(),
      } satisfies z.infer<typeof STFEntryFromClient>;
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify(entry)
      });
      if (!res.ok) {
        throw new Error();
      }
      const {id: entryId} = IdObject.parse(await res.json());

      for (const file of files) {
        let readBytes = 0;
        let chunkInd = 0;
        let fileId = '';
        if (file.size === 0) {
          const emptyBlob = new Blob();
          const stfFile = await getStfFile(file, fileId, entryId, emptyBlob, chunkInd);
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: JSON.stringify(stfFile),
          });
          if (!res.ok) {
            throw new Error();
          }
          continue;
        }
        while (readBytes < file.size) {
          const CHUNK_SIZE = 1024 * 1024;
          const chunk = file.slice(readBytes, readBytes + CHUNK_SIZE);
          readBytes += chunk.size;
          const stfFile = await getStfFile(file, fileId, entryId, chunk, chunkInd);
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: JSON.stringify(stfFile),
          });
          if (!res.ok) {
            throw new Error();
          }
          fileId = fileId || IdObject.parse(await res.json()).id;
          // fileId must be non empty string here.
          NonEmptyString.parse(fileId);
          chunkInd++;
        }
      }
      setStatus('idle');
    } catch (e) {
      console.error(e);
      setStatus('uploadError');
    }
  }, [files]);

  useEffect(() => {
    const isOkay = !!files && files?.length > 0;
    setStatus(isOkay ? 'okayToUpload' : 'idle');
  }, [files]);

  return {
    files,
    status,
    onDragOverEvent,
    onDropEvent,
    onChangeEvent,
    clickInputElement,
    upload,
  };
};

export default useUpload;
