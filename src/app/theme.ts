'use client';
import {createTheme} from '@mui/material';

const theme = createTheme({
  // This prevents SSR flickers.
  cssVariables: true,
  // Enable mui built-in dark scheme from user preferences.
  colorSchemes: {
    dark: true,
  },
});

export default theme;
