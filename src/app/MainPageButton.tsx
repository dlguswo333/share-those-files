import Button from '@mui/material/Button';
import Link from 'next/link';

const GoToMainButton = () => {
  return <Link legacyBehavior={true} passHref={true} href='/' >
    <Button variant='outlined'>
      Main
    </Button>
  </Link>;
};

export default GoToMainButton;
