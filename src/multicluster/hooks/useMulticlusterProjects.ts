import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { getCluster } from '@multicluster/helpers/selectors';
import useKubevirtSearchPoll from '@multicluster/hooks/useKubevirtSearchPoll';
import useIsACMPage from '@multicluster/useIsACMPage';

export type UseMulticlusterNamespacesReturnType = [
  projectsByCluster: Record<string, K8sResourceCommon[]>,
  loaded: boolean,
  error: any,
];

const useMulticlusterNamespaces = (): UseMulticlusterNamespacesReturnType => {
  const isACMTreeView = useIsACMPage();

  const [namespaces, namespacesLoaded, namespacesError] = useKubevirtSearchPoll<
    K8sResourceCommon[]
  >(
    isACMTreeView
      ? {
          groupVersionKind: modelToGroupVersionKind(NamespaceModel),
          isList: true,
        }
      : {},
  );

  const namespacesByCluster = namespaces?.reduce((acc, project) => {
    const cluster = getCluster(project);

    if (!(cluster in acc)) acc[cluster] = [];

    acc[cluster].push(project);

    return acc;
  }, {} as Record<string, K8sResourceCommon[]>);

  return [namespacesByCluster, namespacesLoaded, namespacesError];
};

export default useMulticlusterNamespaces;
