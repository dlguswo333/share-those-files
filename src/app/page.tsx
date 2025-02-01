import styles from '@/app/page.module.css';
import Button from '@mui/material/Button';
import Link from 'next/link';
import DownloadPageButton from './DownloadPageButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export default function Home () {
  return <>
    <AppBar position='sticky'>
      <Toolbar sx={{justifyContent: 'space-between'}}>
        <span />
        <Typography component='h1'>
          Share Those Files!
        </Typography>
        <span />
      </Toolbar>
    </AppBar>
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
  </>;
}
