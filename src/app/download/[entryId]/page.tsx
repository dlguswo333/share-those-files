import {Fragment} from 'react';
import styles from '@/app/download/[entryId]/page.module.css';
import List from '@mui/material/List';
import FileItem from '@/app/FileItem';
import Divider from '@mui/material/Divider';
import IndexDB from '@/back/IndexDB';
import {STFFile} from '@/types';
import DownloadButton from './DownloadButton';
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
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <GoToMainButton />
          <span className={styles.middle}>
            Cannot find the upload entry with the id.
            Maybe it had been deleted long ago?
          </span>
          <span className={styles.right} />
        </header>
      </main>
    );
  }
  const files = STFFile.array().parse(
    await Promise.all(fileIds.map(fileId => {
      return db.getFileById(fileId);
    }))
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <GoToMainButton />
        <span className={styles.middle} />
        <DownloadButton downloadUrl={`/api/download/?entryId=${entryId}`} />
      </header>
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
  );
};
