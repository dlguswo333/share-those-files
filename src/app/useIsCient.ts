import {useEffect, useState} from 'react';

const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setIsClient(true);
  }, []);
  return isClient;
};

export default useIsClient;
