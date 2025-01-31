'use client';
import Button from '@mui/material/Button';

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
  >
    Download
  </Button>;
};

export default DownloadButton;
