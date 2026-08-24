import { useEffect, useMemo, useState } from 'react';
import useWebSocket from 'react-use-websocket';

import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  consoleFetch,
  type K8sResourceCommon,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import useDeepCompareMemoize from '../useDeepCompareMemoize/useDeepCompareMemoize';
import { type KubevirtDataPodFilters } from './types';
import useKubevirtDataPodFilters from './useKubevirtDataPodFilters';
import {
  compareNameAndNamespace,
  constructURL,
  getResourceVersion,
  registerResourceVersion,
} from './utils/utils';

export type NullableWatchK8sResource = null | WatchK8sResource;

type FetchResponseData = {
  items?: K8sResourceCommon[];
  metadata?: { resourceVersion?: string };
};

const nullResponse: [undefined, false, null] = [undefined, false, null];

const useKubevirtDataPod = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: NullableWatchK8sResource,
  filterOptions?: KubevirtDataPodFilters,
): [T | undefined, boolean, Error | null] => {
  const [data, setData] = useState<T>((<unknown>[]) as T);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [resourceVersion, setResourceVersion] = useState<null | number>(null);
  const query = useKubevirtDataPodFilters(filterOptions);
  const watchOptionsMemoized = useDeepCompareMemoize<NullableWatchK8sResource>(watchOptions, true);
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
        ...(resourceVersion != null && { resourceVersion }),
        watch: 'true',
      },
      share: true,
    },
    shouldConnect && Boolean(resourceVersion) && !isEmpty(watchOptionsMemoized?.groupVersionKind),
  );
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async (): Promise<void> => {
      if (!watchOptionsMemoized?.groupVersionKind?.kind) {
        return;
      }

      setLoaded(false);
      try {
        const response = await consoleFetch(url, { signal: controller.signal });
        const jsonData = (await response.json()) as FetchResponseData;
        if (jsonData?.metadata?.resourceVersion) {
          registerResourceVersion(
            watchOptionsMemoized.groupVersionKind.kind,
            jsonData.metadata.resourceVersion,
          );
          setResourceVersion(getResourceVersion(watchOptionsMemoized.groupVersionKind.kind));
        }
        setData(jsonData?.items ? (jsonData.items as T) : (jsonData as unknown as T));
        setShouldConnect(true);
        setLoaded(true);
      } catch (e) {
        if (!controller.signal.aborted) {
          setError(new Error((e as Error).message));
          setLoaded(true);
        }
      }
    };
    !isEmpty(watchOptionsMemoized) && void fetchData();
    return (): void => {
      controller.abort();
    };
  }, [watchOptionsMemoized, url, query]);

  useEffect(() => {
    if (socket?.lastJsonMessage?.type === 'ADDED') {
      setData((prevData) => {
        if (!Array.isArray(prevData)) {
          return socket?.lastJsonMessage?.object as T;
        }

        (prevData as K8sResourceCommon[])?.push(socket?.lastJsonMessage?.object);
        return prevData;
      });
      return;
    }

    if (socket?.lastJsonMessage?.type === 'DELETED') {
      setData((prevData) => {
        if (!Array.isArray(prevData)) {
          return undefined;
        }

        const filteredItems = (prevData as K8sResourceCommon[])?.filter(
          (item: K8sResourceCommon) =>
            !compareNameAndNamespace(item, socket?.lastJsonMessage?.object),
        );
        return filteredItems as T;
      });
      return;
    }

    if (socket?.lastJsonMessage?.object) {
      setData((prevData) => {
        if (!Array.isArray(prevData)) {
          return socket?.lastJsonMessage?.object as T;
        }

        const newData = (prevData as K8sResourceCommon[])?.map((item: K8sResourceCommon) => {
          if (compareNameAndNamespace(item, socket?.lastJsonMessage?.object)) {
            return socket?.lastJsonMessage?.object;
          }
          return item;
        });
        return !isEmpty(newData) ? (newData as T) : ([socket?.lastJsonMessage?.object] as T);
      });
    }
  }, [socket?.lastJsonMessage]);

  const defaultData = useMemo(
    () => (watchOptions?.isList ? ([] as T) : undefined),
    [watchOptions?.isList],
  );

  const watchResult: [T | undefined, boolean, Error | null] = useMemo(
    () => [isEmpty(data) ? defaultData : data, loaded, error],
    [data, defaultData, loaded, error],
  );

  if (!watchOptions) {
    return nullResponse;
  }

  return watchResult;
};

export default useKubevirtDataPod;
