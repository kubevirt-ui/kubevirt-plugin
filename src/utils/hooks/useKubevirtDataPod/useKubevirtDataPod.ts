import { useEffect, useMemo, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  consoleFetch,
  K8sResourceCommon,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import useDeepCompareMemoize from '../useDeepCompareMemoize/useDeepCompareMemoize';

import {
  compareNameAndNamespace,
  constructURL,
  getResourceVersion,
  registerResourceVersion,
} from './utils/utils';
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
    `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}${url}`,
    {
      onClose: () => kubevirtConsole.log('websocket closed kubevirt: ', url),
      onError: (err) => kubevirtConsole.log('Websocket error kubevirt:', err),
      onOpen: () => kubevirtConsole.log('websocket open kubevirt: ', url),
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
      setLoaded(false);
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

    if (socket?.lastJsonMessage?.type == 'DELETED') {
      setData((prevData) => {
        const filteredItems = (prevData as T & { items: T[] })?.items?.filter(
          (item) => !compareNameAndNamespace(item, socket?.lastJsonMessage?.object),
        );
        return { ...prevData, items: filteredItems };
      });
      return;
    }

    if (socket?.lastJsonMessage?.object) {
      setData((prevData) => {
        const newData = (prevData as T & { items: T[] })?.items.map((item) => {
          if (compareNameAndNamespace(item, socket?.lastJsonMessage?.object)) {
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
