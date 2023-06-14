import { useEffect, useMemo, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  consoleFetch,
  K8sResourceCommon,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import useDeepCompareMemoize from '../useDeepCompareMemoize/useDeepCompareMemoize';

import { constructURL, getResourceVersion, registerResourceVersion } from './utils/utils';
import useKubevirtDataPodFilters from './useKubevirtDataPodFilters';

type UseKubevirtDataPod = <T extends K8sResourceCommon>(
  watchOptions: WatchK8sResource,
  filterOptions?: { [key: string]: string },
) => [T, boolean, Error];

const useKubevirtDataPod: UseKubevirtDataPod = <T extends K8sResourceCommon>(
  watchOptions: WatchK8sResource,
  filterOptions?: { [key: string]: string },
) => {
  const [data, setData] = useState<T>((<unknown>[]) as T);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<Error>(null);
  const [resourceVersion, setResourceVersion] = useState<string>(null);
  const query = useKubevirtDataPodFilters(filterOptions);
  const watchOptionsMemoized = useDeepCompareMemoize<WatchK8sResource>(watchOptions, true);
  const url = useMemo(
    () => constructURL(watchOptionsMemoized, query),
    [query, watchOptionsMemoized],
  );
  const [shouldConnect, setShouldConnect] = useState<boolean>(false);
  const socket = useWebSocket<{ object: K8sResourceCommon; type: string }>(
    `ws://${window.location.host}${url}`,
    {
      onClose: () => console.log('websocket closed kubevirt: ', url),
      onOpen: () => console.log('websocket open kubevirt: ', url),
      queryParams: {
        cluster: 'local-cluster',
        resourceVersion,
        watch: 'true',
        // fieldSelector: 'metadata.name=?',
      },
      share: true,
    },
    shouldConnect && Boolean(resourceVersion),
  );
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await consoleFetch(url);
        const jsonData = await response.json();
        registerResourceVersion(
          watchOptionsMemoized.groupVersionKind.kind,
          jsonData?.metadata?.resourceVersion,
        );
        setResourceVersion(getResourceVersion(watchOptionsMemoized.groupVersionKind.kind));
        setData(jsonData);
        setShouldConnect(true);
        setLoaded(true);
      } catch (e) {
        setError(new Error(e.msg));
        setLoaded(true);
      }
    };
    !isEmpty(watchOptionsMemoized) && fetch();
  }, [watchOptionsMemoized, url, query]);

  useEffect(() => {
    if (socket?.lastJsonMessage?.type == 'ADDED') {
      setData((prevData) => {
        (prevData as T & { items: T[] })?.items?.push(<T>socket?.lastJsonMessage?.object);
        return prevData;
      });
      return;
    }

    if (socket?.lastJsonMessage?.object) {
      const { name: socketItemName, namespace: socketItemNamespace } =
        socket?.lastJsonMessage?.object?.metadata;

      setData((prevData) => {
        const newData = (prevData as T & { items: T[] })?.items.map((item) => {
          const { name: itemName, namespace: itemNamespace } = item?.metadata;
          if (itemName === socketItemName && itemNamespace === socketItemNamespace) {
            return socket?.lastJsonMessage?.object;
          }
          return item;
        });
        return !isEmpty(newData)
          ? { ...prevData, items: newData }
          : (socket?.lastJsonMessage?.object as T);
      });
    }
  }, [socket.lastJsonMessage]);

  if (!watchOptions) return [<T>(<unknown>[]), false, null];

  return [data, loaded, error];
};

export default useKubevirtDataPod;
