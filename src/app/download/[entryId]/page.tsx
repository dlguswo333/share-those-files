import {Fragment} from 'react';
import styles from '@/app/download/[entryId]/page.module.css';
import List from '@mui/material/List';
import FileItem from '@/app/FileItem';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IndexDB from '@/back/IndexDB';
import {STFFile} from '@/types';
import DownloadButton from '@/app/download/[entryId]/DownloadButton';
import GoToMainButton from '@/app/MainPageButton';

type Props = {
  params: Promise<{ entryId: string }>
};

export default async function Download ({params}: Props) {
  const {entryId} = await params;
  const db = new IndexDB();
  await db.init();
  const entry = await db.getEntryById(entryId);
  const fileIds = await db.getFileIdsByEntryId(entryId);
  if (entry === null || fileIds === null) {
    return <>
      <AppBar position='sticky'>
        <Toolbar sx={{justifyContent: 'space-between'}}>
          <GoToMainButton />
        </Toolbar>
      </AppBar>
      <main className={styles.page}>
        <span className={styles.middle}>
          Cannot find the upload entry with the id.
          Maybe it had been deleted long ago?
        </span>
      </main>
    </>;
  }
  const files = STFFile.array().parse(
    await Promise.all(fileIds.map(fileId => {
      return db.getFileById(fileId);
    }))
  );

  return <>
    <AppBar position='sticky'>
      <Toolbar sx={{justifyContent: 'space-between'}}>
        <GoToMainButton />
        <DownloadButton downloadUrl={`/api/download/?entryId=${entryId}`} />
      </Toolbar>
    </AppBar>
    <main className={styles.page}>
      {!!files?.length && <List
        sx={{minWidth: '300px', maxWidth: '90vw', border: '1px solid #9999', borderRadius: '8px'}}>
        {files.map((file, index) => (
          <Fragment key={index}>
            <FileItem key={file.name} file={file} />
            {index !== files.length - 1 && <Divider component='li' />}
          </Fragment>
        ))}
      </List>}
    </main>
  </>;
};
