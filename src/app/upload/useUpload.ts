import {ChangeEvent, DragEvent, RefObject, useCallback, useEffect, useState} from 'react';

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
    // [TODO]
    console.log('upload');
    setStatus('uploading');
  }, []);

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
