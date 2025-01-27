'use client';
import styles from '@/app/upload/page.module.css';
import useUpload from './useUpload';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import FileItem from '@/app/FileItem';
import {Fragment, useRef} from 'react';
import {Divider} from '@mui/material';

export default function Upload () {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    files,
    okayToUpload,
    onDragOverEvent,
    onDropEvent,
    onChangeEvent,
    clickInputElement,
    upload,
  } = useUpload({inputRef});

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button
          variant={okayToUpload ? 'contained' : 'outlined'}
          disabled={!okayToUpload}
          onClick={upload}
        >
          OK
        </Button>
      </header>
      <div className={styles.inputArea}
        onDragOver={onDragOverEvent}
        onDrop={onDropEvent}>
        <div>Drag and drop files here.</div>
        <input type='file' multiple={true} onChange={onChangeEvent} ref={inputRef} />
        <Button variant='contained' onClick={clickInputElement}>Choose File</Button>
      </div>
      {!!files && <List
        sx={{minWidth: '300px', maxWidth: '90vw', border: '1px solid #9999', borderRadius: '8px'}}>
        {files.map((file, index) => (
          <Fragment key={index}>
            <FileItem key={file.name} file={file} />
            {index !== files.length - 1 && <Divider component='li' />}
          </Fragment>
        ))}
      </List>}
    </main>
  );
}
