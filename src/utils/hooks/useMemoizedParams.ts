import { useParams } from 'react-router-dom-v5-compat';

import useDeepCompareMemoize from './useDeepCompareMemoize/useDeepCompareMemoize';

const useMemoizedParams = <T extends Record<string, string> | string>() => {
  const params = useParams<T>();

  return useDeepCompareMemoize(params, true);
};

export default useMemoizedParams;
