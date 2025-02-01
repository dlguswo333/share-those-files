'use client';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {useRouter} from 'next/navigation';
import {useCallback, useMemo, useRef, useState} from 'react';
import useIsClient from './useIsCient';

const DownloadPageButton = () => {
  const [input, setInput] = useState('');
  const router = useRouter();
  const isClient = useIsClient();
  const textFieldRef = useRef<HTMLDivElement | null>(null);
  const placeholder = isClient ? new URL('/download/abcd-1234', window.location.origin).toString() : '';
  const isValidURL = useMemo(() => {
    if (!isClient) {
      return false;
    }
    try {
      const url = new URL(input);
      if (url.origin !== window.location.origin) {
        return false;
      }
      if (!/^\/download\/[^/]+$/.test(url.pathname)) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, [input, isClient]);

  const navigate = useCallback(() => {
    if (isValidURL) {
      router.push(new URL(input).pathname);
    }
  }, [input, isValidURL, router]);

  return (
    <Button variant='outlined'
      disableRipple={true}
      color={(!!input.length && !isValidURL) ? 'error' : undefined}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (textFieldRef.current?.contains(target)) {
          return;
        }
        navigate();
      }}
      sx={{
        minWidth: 300,
        aspectRatio: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      Download
      <TextField
        ref={textFieldRef}
        id="outlined-basic"
        label="Download URL"
        variant="outlined"
        placeholder={placeholder}
        onKeyUp={(e) => {
          if (e.key !== 'Enter') {
            return;
          }
          navigate();
        }}
        onChange={e => setInput(e.target.value)}
        error={!!input.length && !isValidURL}
        // Pass whitespace to helperText to maintain uniform height.
        helperText={(input.length && !isValidURL) ? 'Invalid URL' : ' '}
      />
    </Button>
  );
};

export default DownloadPageButton;
