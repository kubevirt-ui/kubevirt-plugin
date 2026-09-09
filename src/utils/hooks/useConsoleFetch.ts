import { useEffect, useState } from 'react';

import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

export type ConsoleFetchResponse<R> = {
  data: R;
  error: Error | null;
  loaded: boolean;
};

const useConsoleFetch = <R>(
  url: null | string,
  timeout?: number,
  initialValue?: R,
): ConsoleFetchResponse<R> => {
  const [data, setData] = useState<R | undefined>(initialValue);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) return;
    if (loaded) return;

    const fetchData = async (): Promise<void> => {
      try {
        const response = await consoleFetch(url, initialValue, timeout);
        setData(await response.json());
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setLoaded(true);
      }
    };

    void fetchData();
  }, [initialValue, loaded, timeout, url]);

  return { data, error, loaded };
};

export default useConsoleFetch;
