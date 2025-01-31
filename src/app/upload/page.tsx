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
import Chip from '@mui/material/Chip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GoToMainButton from '../MainPageButton';

export default function Upload () {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    files,
    status,
    entryId,
    onDragOverEvent,
    onDropEvent,
    onChangeEvent,
    clickInputElement,
    upload,
    resetStatus,
  } = useUpload({inputRef});

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <GoToMainButton />
        <span />
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
        open={status === 'complete' || status === 'uploadError'}
        onClose={resetStatus}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id="alert-dialog-title">
          {status === 'complete' ? 'Upload Complete' : 'Upload Error'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {status === 'complete' &&
              <>
                Files have been uploaded succesfully.
                <br />
              </>
            }
            {status === 'uploadError' &&
              <>
                There has been an error when uploading files.
                <br />
                Try again.
              </>
            }
          </DialogContentText>
          {status === 'complete' &&
            <Chip
              label={new URL(`/download/${entryId}`, window.location.origin).toString()}
              onClick={() => {
                navigator.clipboard.writeText(new URL(`/download/${entryId}`, window.location.origin).toString());
              }}
              icon={<ContentCopyIcon fontSize='small' />}
            />
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={resetStatus} autoFocus>
            Okay
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
