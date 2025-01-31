'use client';
import Button from '@mui/material/Button';
import styles from '@/app/download/[entryId]/page.module.css';

type Props = {
  downloadUrl: string;
};

const DownloadButton = ({downloadUrl}: Props) => {
  const download = () => {
    window.location.assign(downloadUrl);
  };

  return <Button
    variant='contained'
    onClick={download}
    className={styles.right}
  >
    Download
  </Button>;
};

export default DownloadButton;
