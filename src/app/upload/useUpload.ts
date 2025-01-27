import {ChangeEvent, DragEvent, RefObject, useCallback, useState} from 'react';

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

const useUpload = ({inputRef}: Props) => {
  const [okayToContinue /* setOkayToContinue */] = useState(false);
  const [files, setFiles] = useState<File[] | null>(null);

  const onDragOverEvent = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
  }, []);

  const onDropEvent = useCallback(async (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    const fileList = e.dataTransfer.files;

    const filesExcludingFolders = await excludeFolders([...fileList]);
    setFiles(filesExcludingFolders);
    if (inputRef.current) {
      inputRef.current.files = fileList;
    }
  }, [inputRef]);

  const onChangeEvent = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) {
      return;
    }
    const filesExcludingFolders = await excludeFolders([...fileList]);
    setFiles(filesExcludingFolders);
  }, []);

  const clickInputElement = useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);

  return {
    okayToContinue,
    files,
    onDragOverEvent,
    onDropEvent,
    onChangeEvent,
    clickInputElement,
  };
};

export default useUpload;
