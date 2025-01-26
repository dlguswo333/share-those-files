import styles from '@/app/page.module.css';
import Button from '@mui/material/Button';

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.buttonContainer}>
        <Button variant='outlined' sx={{minWidth: 100, aspectRatio: 1}}>
          Hello
        </Button>
        <Button variant='outlined' sx={{minWidth: 100, aspectRatio: 1}}>
          mui!
        </Button>
      </div>
    </main>
  );
}
