import { useEffect, useMemo, useState } from 'react';

import {
  AccessReviewResourceAttributes,
  K8sResourceCommon,
  K8sVerb,
  useK8sModel,
  useK8sWatchResource,
  useK8sWatchResources,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_APISERVER_PROXY } from './useFeatures/constants';
import { useFeatures } from './useFeatures/useFeatures';
import useKubevirtDataPodHealth from './useKubevirtDataPod/hooks/useKubevirtDataPodHealth';
import useKubevirtDataPod from './useKubevirtDataPod/useKubevirtDataPod';
import { useIsAdmin } from './useIsAdmin';
import useMultipleAccessReviews from './useMultipleAccessReviews';
import useProjects from './useProjects';

type Result<R extends K8sResourceCommon | K8sResourceCommon[]> = [R, boolean, Error];

type UseKubevirtWatchResource = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource,
  filterOptions?: { [key: string]: string },
) => Result<T>;
const useKubevirtWatchResource: UseKubevirtWatchResource = <T>(watchOptions, filterOptions) => {
  const [data, setData] = useState<T>((<unknown>[]) as T);
  const [loadedData, setLoadedData] = useState<boolean>(false);
  const [loadErrorData, setLoadErrorData] = useState<Error>();
  const isProxyPodAlive = useKubevirtDataPodHealth();
  const { featureEnabled, loading } = useFeatures(KUBEVIRT_APISERVER_PROXY);
  const shouldUseProxyPod = useMemo(() => {
    if (!featureEnabled && !loading) return false;
    if (featureEnabled && !loading && isProxyPodAlive !== null) return isProxyPodAlive;
    return null;
  }, [featureEnabled, loading, isProxyPodAlive]);

  const isAdmin = useIsAdmin();
  // "All projects" (no namespace) would otherwise watch cluster-wide, which non-admins are
  // rarely granted -- fall back to aggregating per-namespace watches they're allowed to list.
  const needsNamespaceFiltering = !watchOptions?.namespace && !isAdmin;

  const [model] = useK8sModel(watchOptions?.groupVersionKind);
  const [projectNames] = useProjects();

  const listAccessReviewAttributes = useMemo<AccessReviewResourceAttributes[]>(
    () =>
      needsNamespaceFiltering && model
        ? (projectNames || []).map((namespace) => ({
            group: model.apiGroup,
            namespace,
            resource: model.plural,
            verb: 'list' as K8sVerb,
          }))
        : [],
    [needsNamespaceFiltering, model, projectNames],
  );
  const [listAccessReviews, listAccessReviewsLoading] = useMultipleAccessReviews(
    listAccessReviewAttributes,
  );

  const allowedNamespaces = useMemo(
    () =>
      (listAccessReviews || [])
        .filter((review) => review.allowed)
        .map((review) => review.resourceAttributes?.namespace)
        .filter(Boolean),
    [listAccessReviews],
  );

  const [resourceK8sWatch, loadedK8sWatch, loadErrorK8sWatch] = useK8sWatchResource<T>(
    shouldUseProxyPod === false && !needsNamespaceFiltering && watchOptions,
  );

  const perNamespaceResources = useK8sWatchResources<{ [namespace: string]: T }>(
    Object.fromEntries(
      shouldUseProxyPod === false && needsNamespaceFiltering
        ? allowedNamespaces.map((namespace) => [namespace, { ...watchOptions, namespace }])
        : [],
    ),
  );

  const [resourceKubevirtDataPod, loadedKubevirtDataPod, loadErrorKubevirtDataPod] =
    useKubevirtDataPod<T>(shouldUseProxyPod ? watchOptions : {}, filterOptions);

  useEffect(() => {
    if (shouldUseProxyPod === null) {
      return;
    }

    let resource;
    let loaded;
    let loadError;

    if (shouldUseProxyPod) {
      [resource, loaded, loadError] = [
        resourceKubevirtDataPod,
        loadedKubevirtDataPod,
        loadErrorKubevirtDataPod,
      ];
    } else if (needsNamespaceFiltering) {
      const perNamespaceResourceList = Object.values(perNamespaceResources);

      resource = perNamespaceResourceList.flatMap(
        (namespaceResource) => namespaceResource?.data ?? [],
      );
      loaded =
        !listAccessReviewsLoading &&
        (allowedNamespaces.length === 0 ||
          perNamespaceResourceList.every((namespaceResource) => namespaceResource?.loaded));
      loadError = perNamespaceResourceList.find(
        (namespaceResource) => namespaceResource?.loadError,
      )?.loadError;
    } else {
      [resource, loaded, loadError] = [resourceK8sWatch, loadedK8sWatch, loadErrorK8sWatch];
    }

    setLoadedData(loaded);

    if (loadError) {
      // A namespace failure shouldn't be masked by other namespaces' data resolving successfully.
      setLoadErrorData(loadError);
      setLoadedData(true);
    } else if (resource && loaded) {
      const isList = typeof resource?.[0] === 'string';
      setData((isList && resource?.[1]) || (<T & { items?: T[] }>resource)?.items || resource);
      setLoadedData(loaded);
      setLoadErrorData(null);
    }
  }, [
    resourceKubevirtDataPod,
    loadedKubevirtDataPod,
    loadErrorKubevirtDataPod,
    resourceK8sWatch,
    loadedK8sWatch,
    loadErrorK8sWatch,
    isProxyPodAlive,
    shouldUseProxyPod,
    needsNamespaceFiltering,
    perNamespaceResources,
    listAccessReviewsLoading,
    allowedNamespaces,
  ]);
  return [data, loadedData, loadErrorData];
};

export default useKubevirtWatchResource;
