'use client';
import styles from '@/app/upload/page.module.css';
import useUpload from './useUpload';
import Button from '@mui/material/Button';
import FileItem from '../FileItem';
import { useRef } from 'react';

export default function Upload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    files,
    okayToContinue,
    onDragOverEvent,
    onDropEvent,
    onChangeEvent
  } = useUpload({inputRef});

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant={okayToContinue ? 'contained' : 'outlined'} disabled={!okayToContinue}>OK</Button>
      </header>
      <div className={styles.inputArea}
        onDragOver={onDragOverEvent}
        onDrop={onDropEvent}>
        <div>Drag and drop files here.</div>
        <input type='file' multiple={true} onChange={onChangeEvent} ref={inputRef} />
      </div>
      <div>
        {files?.map(file => (<FileItem key={file.name} file={file} />))}
      </div>
    </main>
  );
}
