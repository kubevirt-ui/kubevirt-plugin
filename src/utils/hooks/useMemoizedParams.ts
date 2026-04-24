import { useParams } from 'react-router';

import useDeepCompareMemoize from './useDeepCompareMemoize/useDeepCompareMemoize';

const useMemoizedParams = <T extends Record<string, string> | string>() => {
  const params = useParams<T>();

  return useDeepCompareMemoize(params, true);
};

export default useMemoizedParams;
