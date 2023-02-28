import { useEffect, useState } from 'react';

import { useK8sWatchResource, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

const useKubevirtWatchResource = (watchOptions: WatchK8sResource) => {
  const [data, setData] = useState([]);
  const [loadedData, setLoadedData] = useState<boolean>(false);
  const [loadErrorData, setLoadErrorData] = useState<any>();
  const [resource, loaded, loadError] = useK8sWatchResource<any>(watchOptions);

  useEffect(() => {
    if (loadError) {
      setLoadErrorData(loadError);
      setLoadedData(true);
    }
    if (resource && loaded) {
      const isList = typeof resource?.[0] === 'string';
      setData((isList && resource?.[1]) || resource?.items || resource);
      setLoadedData(loaded);
      setLoadErrorData(null);
    }
  }, [resource, loaded, loadError]);
  return [data, loadedData, loadErrorData];
};

export default useKubevirtWatchResource;
