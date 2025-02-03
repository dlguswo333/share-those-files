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
        <span>
          <Typography component='h1' className={styles.headerTitle}>
            share-those-files!
          </Typography>
        </span>
        <span />
      </Toolbar>
    </AppBar>
    <main className={styles.page}>
      <Typography component='h1'
        className={styles.pageTitle}
        sx={{
          marginBottom: '20px',
          transform: 'skew(5deg)',
          animation: `ease ${styles.hover} 5s infinite`,
          userSelect: 'none',
          fontWeight: 'bold',
          fontSize: '4rem',
          lineHeight: 1,
          color: 'white',
          textShadow: `
            1px 1px #000,
            1px -1px #000,
            -1px 1px #000,
            -1px -1px #000,
            2px 2px #25f,
            3px 3px #25f,
            4px 4px #25f,
            5px 5px #25f`,
        }}
      >
          share-<br />
          those-<br />
          files!<br />
      </Typography>
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
