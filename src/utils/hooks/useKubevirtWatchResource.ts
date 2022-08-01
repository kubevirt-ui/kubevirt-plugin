import { useEffect, useState } from 'react';

import { useK8sWatchResource, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

const useKubevirtWatchResource = (watchOptions: WatchK8sResource) => {
  const [data, setData] = useState([]);
  const [resource, loaded, loadError] = useK8sWatchResource<any>(watchOptions);

  useEffect(() => {
    if (resource && loaded) {
      const isList = typeof resource?.[0] === 'string';
      setData((isList && resource?.[1]) || resource?.items || resource);
    }
  }, [resource, loaded]);
  return [data, loaded, loadError];
};

export default useKubevirtWatchResource;
