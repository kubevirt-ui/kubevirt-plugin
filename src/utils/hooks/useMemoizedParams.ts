import { type Params, useParams } from 'react-router';

import useDeepCompareMemoize from './useDeepCompareMemoize/useDeepCompareMemoize';

const useMemoizedParams = <
  T extends Record<string, string | undefined> | string = Record<string, string | undefined>,
>(): Readonly<[T] extends [string] ? Params<T> : Partial<T>> => {
  const params = useParams<T>();

  return useDeepCompareMemoize(params, true);
};

export default useMemoizedParams;
