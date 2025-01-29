'use client';
import styles from '@/app/upload/page.module.css';
import useUpload from './useUpload';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import FileItem from '@/app/FileItem';
import {Fragment, useRef} from 'react';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function Upload () {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    files,
    status,
    onDragOverEvent,
    onDropEvent,
    onChangeEvent,
    clickInputElement,
    upload,
    handleError,
  } = useUpload({inputRef});

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button
          variant={status === 'okayToUpload' ? 'contained' : 'outlined'}
          disabled={status !== 'okayToUpload'}
          onClick={upload}
        >
          OK
        </Button>
      </header>
      <div className={styles.inputArea}
        onDragOver={onDragOverEvent}
        onDrop={onDropEvent}>
        <div>
          {status === 'uploading' ? 'Uploading...' : 'Drag and drop files here.'}
        </div>
        <input type='file' multiple={true} onChange={onChangeEvent} ref={inputRef} />
        <Button variant='contained'
          disabled={status === 'uploading'}
          onClick={clickInputElement}
        >
          Choose File
        </Button>
      </div>
      {!!files?.length && <List
        sx={{minWidth: '300px', maxWidth: '90vw', border: '1px solid #9999', borderRadius: '8px'}}>
        {files.map((file, index) => (
          <Fragment key={index}>
            <FileItem key={file.name} file={file} />
            {index !== files.length - 1 && <Divider component='li' />}
          </Fragment>
        ))}
      </List>}
      <Dialog
        open={status === 'uploadError'}
        onClose={handleError}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id="alert-dialog-title">
          Upload Error
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            There has been an error when uploading files.
            Try again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleError} autoFocus>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
