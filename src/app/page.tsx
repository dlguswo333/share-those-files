import styles from '@/app/page.module.css';
import Button from '@mui/material/Button';
import Link from 'next/link';
import DownloadPageButton from './DownloadPageButton';

export default function Home () {
  return (
    <main className={styles.page}>
      <div className={styles.buttonContainer}>
        <DownloadPageButton />
        <Link legacyBehavior={true} passHref={true} href='/upload'>
          <Button variant='outlined' sx={{minWidth: 300, aspectRatio: 1}} >
            Upload
          </Button>
        </Link>
      </div>
    </main>
  );
}
