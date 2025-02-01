import Button from '@mui/material/Button';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';

const GoToMainButton = () => {
  return <Link legacyBehavior={true} passHref={true} href='/'>
    <Button variant='contained' disableElevation={true} startIcon={<HomeIcon />}>
      Main
    </Button>
  </Link>;
};

export default GoToMainButton;
