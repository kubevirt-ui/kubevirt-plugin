import { useCallback, useEffect, useState } from 'react';

import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

const useScreenshot = (
  basePath: string,
): {
  error: Error;
  loaded: boolean;
  refreshScreenshot: () => void;
  screenshot: Blob;
} => {
  const [refreshTrigger, setRefreshTrigger] = useState(1);
  const refreshScreenshot = useCallback(() => {
    setRefreshTrigger((prev) => (prev + 1) % 2);
  }, []);

  const [data, setData] = useState<Blob>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error>(null);
  const url = `${basePath}/vnc/screenshot`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoaded(false);
        setError(null);
        const response = await consoleFetch(url);
        const blob = await response.blob();
        setData(blob);
      } catch (e) {
        setError(e);
      } finally {
        setLoaded(true);
      }
    };

    fetchData();
  }, [url, refreshTrigger]);

  return { error, loaded, refreshScreenshot, screenshot: data };
};

export default useScreenshot;
