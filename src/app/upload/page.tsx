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
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import GoToMainButton from '@/app/MainPageButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

export default function Upload () {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    files,
    status,
    entryId,
    progress,
    onDragOverEvent,
    onDropEvent,
    onChangeEvent,
    onDeleteDateChange,
    clickInputElement,
    upload,
    resetStatus,
  } = useUpload({inputRef});

  return <>
    <AppBar component='nav' position='sticky'>
      <Toolbar sx={{justifyContent: 'space-between'}}>
        <GoToMainButton />
        <Button
          variant={status === 'okayToUpload' ? 'contained' : 'text'}
          disableElevation={true}
          disabled={status !== 'okayToUpload'}
          onClick={upload}
        >
          Upload
        </Button>
      </Toolbar>
    </AppBar>
    <main className={styles.page}>
      <div className={styles.inputArea}
        onDragOver={onDragOverEvent}
        onDrop={onDropEvent}>
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px'}}>
          <Typography>
            {status === 'uploading' ? 'Uploading...' : 'Drag and drop files here.'}
          </Typography>
          {progress && <>
            <CircularProgress variant="determinate" value={progress.curFilePercent} />
            <div>{progress.curFileName}</div>
            <div>{`${progress.curFileInd}/${progress.numFiles}`}</div>
          </>}
        </Box>
        <input type='file' multiple={true} onChange={onChangeEvent} ref={inputRef} />
        <Button variant='contained'
          disabled={status === 'uploading'}
          onClick={clickInputElement}
        >
          Choose File
        </Button>
      </div>
    </main>
    {!!files?.length &&
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '100px'}}>
        <TextField
          select={true}
          sx={{margin: '10px', minWidth: '400px'}}
          label='This upload will be deleted in:'
          defaultValue={24}
          slotProps={{select: {MenuProps: {disableScrollLock: true}}}}
          onChange={(e) => {
            const date = new Date();
            date.setHours(date.getHours() + Number(e.target.value));
            onDeleteDateChange(date);
          }}
        >
          <MenuItem value={24}>One Day</MenuItem>
          <MenuItem value={72}>Three Days</MenuItem>
          <MenuItem value={168}>One Week</MenuItem>
        </TextField>
        <List
          sx={{minWidth: '400px', maxWidth: '90vw', border: '1px solid #9999', borderRadius: '8px'}}>
          {files.map((file, index) => (
            <Fragment key={index}>
              <FileItem key={file.name} file={file} />
              {index !== files.length - 1 && <Divider component='li' />}
            </Fragment>
          ))}
        </List>
      </Box>
    }
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
  </>;
}
