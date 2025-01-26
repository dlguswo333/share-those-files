import styles from '@/app/page.module.css';
import Button from '@mui/material/Button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.buttonContainer}>
        <Button variant='outlined' sx={{minWidth: 100, aspectRatio: 1}}>
          Hello
        </Button>
        <Button variant='outlined' sx={{minWidth: 100, aspectRatio: 1, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Link href='/upload' className={styles.full}>
            Upload
          </Link>
        </Button>
      </div>
    </main>
  );
}
