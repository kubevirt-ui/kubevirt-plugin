import { useEffect, useState } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';
import { type K8sResourceCommon, type WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import { type FleetK8sGetOptions } from '@stolostron/multicluster-sdk';

const useK8sGetData = <T extends K8sResourceCommon>(
  options: false | FleetK8sGetOptions | null,
): WatchK8sResult<T> => {
  const [data, setData] = useState<T>();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error>();

  const memoizedOptions = useDeepCompareMemoize(options);

  useEffect(() => {
    if (!memoizedOptions) {
      setData(undefined);
      setLoaded(true);
      setError(undefined);
      return;
    }

    let canceled = false;

    setData(undefined);
    setLoaded(false);
    setError(undefined);

    kubevirtK8sGet<T>(memoizedOptions)
      .then((resource) => {
        if (!canceled) {
          setData(resource);
          setLoaded(true);
        }
      })
      .catch((err: unknown) => {
        const normalizedError = err instanceof Error ? err : new Error(String(err));
        if (!canceled) {
          setData(undefined);
          setError(normalizedError);
          setLoaded(true);
        }
      });

    return (): void => {
      canceled = true;
    };
  }, [memoizedOptions]);

  return [data, loaded, error];
};

export default useK8sGetData;
