import { HTTP_METHODS } from '@kubevirt-utils/constants/constants';
import useConsoleFetch from '@kubevirt-utils/hooks/useConsoleFetch';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { DEFAULT_QUERY_TIMEOUT, QUERY_ENDPOINT } from '@lightspeed/utils/api';

type UseLightspeedQuery = (prompt: string) => {
  data: {
    body: string;
    headers: {
      accept: string;
      'Content-Type': string;
    };
    method: HTTP_METHODS;
  };
  dataLoaded: boolean;
  error: Error | null;
};

const useLightspeedQuery: UseLightspeedQuery = (prompt) => {
  const { data, error, loaded } = useConsoleFetch(QUERY_ENDPOINT, DEFAULT_QUERY_TIMEOUT, {
    body: JSON.stringify({ media_type: 'application/json', query: prompt }),
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: HTTP_METHODS.POST,
  });

  if (error) kubevirtConsole.error(error);

  return { data, dataLoaded: loaded, error };
};

export default useLightspeedQuery;
