import { useEffect, useState } from 'react';

import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import useConsoleUserSettingsConfigMap, {
  CONSOLE_USER_SETTINGS_NAMESPACE,
} from '@kubevirt-utils/hooks/useConsoleUserSettingsConfigMap/useConsoleUserSettingsConfigMap';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sPatch } from '@multicluster/k8sRequests';

const CONSOLE_NAMESPACE_BOOKMARKS_KEY = 'console.namespace.bookmarks';

type ConsoleNamespaceBookmarks = Record<string, boolean>;

type UseConsoleNamespaceBookmarks = (
  cluster?: string,
) => [
  ConsoleNamespaceBookmarks,
  (bookmarks: ConsoleNamespaceBookmarks) => Promise<ConsoleNamespaceBookmarks>,
  boolean,
  Error | undefined,
];

const useConsoleNamespaceBookmarks: UseConsoleNamespaceBookmarks = (cluster) => {
  const [error, setError] = useState<Error>();
  const [bookmarks, setBookmarks] = useState<ConsoleNamespaceBookmarks>({});
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
        const bookmarksData = userConfigMap?.data?.[CONSOLE_NAMESPACE_BOOKMARKS_KEY];
        if (bookmarksData) {
          const parsed = JSON.parse(bookmarksData) as ConsoleNamespaceBookmarks;
          setBookmarks(parsed || {});
        } else {
          setBookmarks({});
        }
      } catch (parseError) {
        setError(parseError as Error);
        setBookmarks({});
      }
    } else if (loadedConfigMap && isEmpty(userConfigMap)) {
      // ConfigMap doesn't exist yet, initialize with empty bookmarks
      setBookmarks({});
    }
  }, [userConfigMap, userName, loadedConfigMap]);

  const updateBookmarks = async (newBookmarks: ConsoleNamespaceBookmarks) => {
    if (!userName || !configMapName) {
      throw new Error('User information not available');
    }

    setLoading(true);
    setError(undefined);

    try {
      const bookmarksJson = JSON.stringify(newBookmarks);

      if (isEmpty(userConfigMap)) {
        // ConfigMap doesn't exist, create it
        const newConfigMap: IoK8sApiCoreV1ConfigMap = {
          apiVersion: 'v1',
          data: {
            [CONSOLE_NAMESPACE_BOOKMARKS_KEY]: bookmarksJson,
          },
          kind: 'ConfigMap',
          metadata: {
            name: configMapName,
            namespace: CONSOLE_USER_SETTINGS_NAMESPACE,
          },
        };
        await kubevirtK8sCreate<IoK8sApiCoreV1ConfigMap>({
          cluster,
          data: newConfigMap,
          model: ConfigMapModel,
        });
      } else {
        // ConfigMap exists, patch it
        const patchData = [
          ...(isEmpty(userConfigMap.data)
            ? [{ op: 'add' as const, path: '/data', value: {} }]
            : []),
          {
            op: userConfigMap?.data?.[CONSOLE_NAMESPACE_BOOKMARKS_KEY]
              ? ('replace' as const)
              : ('add' as const),
            path: `/data/${CONSOLE_NAMESPACE_BOOKMARKS_KEY}`,
            value: bookmarksJson,
          },
        ];

        await kubevirtK8sPatch<IoK8sApiCoreV1ConfigMap>({
          cluster,
          data: patchData,
          model: ConfigMapModel,
          resource: userConfigMap,
        });
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

export default useConsoleNamespaceBookmarks;
