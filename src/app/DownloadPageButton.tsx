'use client';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {useRouter} from 'next/navigation';
import {ComponentProps, useCallback, useMemo, useRef, useState} from 'react';
import useIsClient from './useIsCient';
import styles from './page.module.css';

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

  const buttonColor = useMemo<ComponentProps<typeof Button>['color']>(() => {
    if (!input.length) {
      return undefined;
    }
    if (!isValidURL) {
      return 'error';
    }
    return undefined;
  }, [input.length, isValidURL]);

  /** Pass whitespace to helperText to maintain uniform height. */
  const textFieldHelperText = useMemo(() => {
    if (!input.length) {
      return ' ';
    }
    if (!isValidURL) {
      return 'Invalid URL';
    }
    return ' ';
  }, [input.length, isValidURL]);

  const navigate = useCallback(() => {
    if (isValidURL) {
      router.push(new URL(input).pathname);
    }
  }, [input, isValidURL, router]);

  return (
    <div className={styles.buttonWrapper}>
      <TextField
        ref={textFieldRef}
        sx={{
          position: 'absolute',
          zIndex: 10,
          top: '60%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          width: '80%'
        }}
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
        helperText={textFieldHelperText}
      />
      <Button variant='outlined'
        disabled={!isValidURL}
        color={buttonColor}
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
      </Button>
    </div>
  );
};

export default DownloadPageButton;
