import { useEffect, useState } from 'react';

import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
import { kubevirtK8sListItems } from '@multicluster/k8sRequests';
import { K8sModel, K8sResourceCommon, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';

type K8sListDataOptions = {
  cluster?: string;
  model: K8sModel;
  namespace?: string;
};

/**
 * LIST fetch that bypasses useK8sModel by taking a K8sModel directly.
 * Use this instead of useK8sWatchData when the CRD may not exist on the hub
 * cluster (e.g. legacy APIs on spoke clusters in ACM mode).
 */
const useK8sListData = <T extends K8sResourceCommon>(
  options: false | K8sListDataOptions | null,
): WatchK8sResult<T[]> => {
  const [data, setData] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error>();

  const memoizedOptions = useDeepCompareMemoize(options);

  useEffect(() => {
    if (!memoizedOptions) {
      setData([]);
      setLoaded(true);
      setError(undefined);
      return;
    }

    let canceled = false;

    setData([]);
    setLoaded(false);
    setError(undefined);

    kubevirtK8sListItems<T>({
      cluster: memoizedOptions.cluster,
      model: memoizedOptions.model,
      queryParams: memoizedOptions.namespace ? { ns: memoizedOptions.namespace } : {},
    })
      .then((items) => {
        if (!canceled) {
          setData(items);
          setLoaded(true);
          setError(undefined);
        }
      })
      .catch((err: unknown) => {
        const normalizedError = err instanceof Error ? err : new Error(String(err));
        if (!canceled) {
          setError(normalizedError);
          setLoaded(true);
        }
      });

    return () => {
      canceled = true;
    };
  }, [memoizedOptions]);

  return [data, loaded, error];
};

export default useK8sListData;
