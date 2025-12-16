import { useEffect, useState } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import useConsoleUserSettingsConfigMap, {
  CONSOLE_USER_SETTINGS_NAMESPACE,
} from '@kubevirt-utils/hooks/useConsoleUserSettingsConfigMap/useConsoleUserSettingsConfigMap';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sPatch } from '@multicluster/k8sRequests';

const CONSOLE_CLUSTER_BOOKMARKS_KEY = 'console.cluster.bookmarks';

type ConsoleClusterBookmarks = Record<string, boolean>;

type UseConsoleClusterBookmarks = (
  cluster?: string,
) => [
  ConsoleClusterBookmarks,
  (bookmarks: ConsoleClusterBookmarks) => Promise<ConsoleClusterBookmarks>,
  boolean,
  Error | undefined,
];

const useConsoleClusterBookmarks: UseConsoleClusterBookmarks = (cluster) => {
  const [error, setError] = useState<Error>();
  const [bookmarks, setBookmarks] = useState<ConsoleClusterBookmarks>({});
  const [loading, setLoading] = useState<boolean>(false);

  const {
    configMapError,
    configMapName,
    errorUser,
    loadedConfigMap,
    loadedUser,
    userConfigMap,
    userName,
  } = useConsoleUserSettingsConfigMap(cluster);

  useEffect(() => {
    if (!isEmpty(userConfigMap) && userName) {
      try {
        const bookmarksData = userConfigMap?.data?.[CONSOLE_CLUSTER_BOOKMARKS_KEY];
        if (bookmarksData) {
          const parsed = JSON.parse(bookmarksData) as ConsoleClusterBookmarks;
          setBookmarks(parsed || {});
        } else {
          setBookmarks({});
        }
      } catch (parseError) {
        setError(parseError as Error);
        setBookmarks({});
      }
    } else if (loadedConfigMap && isEmpty(userConfigMap)) {
      setBookmarks({});
    }
  }, [userConfigMap, userName, loadedConfigMap]);

  const createConfigMapData = (name: string, bookmarksJson: string): IoK8sApiCoreV1ConfigMap => ({
    apiVersion: 'v1',
    data: {
      [CONSOLE_CLUSTER_BOOKMARKS_KEY]: bookmarksJson,
    },
    kind: 'ConfigMap',
    metadata: {
      name,
      namespace: CONSOLE_USER_SETTINGS_NAMESPACE,
    },
  });

  type PatchOperation = {
    op: 'add' | 'replace';
    path: string;
    value: Record<string, unknown> | string;
  };

  const createPatchData = (
    configMap: IoK8sApiCoreV1ConfigMap,
    bookmarksJson: string,
  ): PatchOperation[] => {
    const patchData: PatchOperation[] = [];

    if (isEmpty(configMap.data)) {
      patchData.push({ op: 'add' as const, path: '/data', value: {} });
    }

    const bookmarkExists = !!configMap?.data?.[CONSOLE_CLUSTER_BOOKMARKS_KEY];
    patchData.push({
      op: bookmarkExists ? ('replace' as const) : ('add' as const),
      path: `/data/${CONSOLE_CLUSTER_BOOKMARKS_KEY}`,
      value: bookmarksJson,
    });

    return patchData;
  };

  const createConfigMap = async (name: string, bookmarksJson: string): Promise<void> => {
    const newConfigMap = createConfigMapData(name, bookmarksJson);
    await kubevirtK8sCreate<IoK8sApiCoreV1ConfigMap>({
      cluster,
      data: newConfigMap,
      model: ConfigMapModel,
    });
  };

  const patchConfigMap = async (
    configMap: IoK8sApiCoreV1ConfigMap,
    bookmarksJson: string,
  ): Promise<void> => {
    const patchData = createPatchData(configMap, bookmarksJson);
    await kubevirtK8sPatch<IoK8sApiCoreV1ConfigMap>({
      cluster,
      data: patchData,
      model: ConfigMapModel,
      resource: configMap,
    });
  };

  const updateBookmarks = async (
    newBookmarks: ConsoleClusterBookmarks,
  ): Promise<ConsoleClusterBookmarks> => {
    if (!userName || !configMapName) {
      throw new Error('User information not available');
    }

    setLoading(true);
    setError(undefined);

    try {
      const bookmarksJson = JSON.stringify(newBookmarks);

      if (isEmpty(userConfigMap)) {
        await createConfigMap(configMapName, bookmarksJson);
      } else {
        await patchConfigMap(userConfigMap, bookmarksJson);
      }

      setBookmarks(newBookmarks);
      setLoading(false);
      return newBookmarks;
    } catch (apiError) {
      const apiErr = apiError as Error;
      setError(apiErr);
      setLoading(false);
      throw apiErr;
    }
  };

  const loadedCM = loadedConfigMap || !isEmpty(configMapError);
  const loadedUsr = loadedUser || !isEmpty(errorUser);

  return [
    bookmarks,
    updateBookmarks,
    !loading && loadedUsr && loadedCM,
    error || errorUser || configMapError,
  ];
};

export default useConsoleClusterBookmarks;
