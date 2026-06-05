import { ALL_CLUSTERS_KEY, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import {
  CLUSTER_LIST_FILTER_PARAM,
  PROJECT_LIST_FILTER_PARAM,
} from '@kubevirt-utils/utils/constants';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';

type ExportParams = {
  cluster: string | undefined;
  namespace: string;
};

const getExportCluster = (
  queryParams: URLSearchParams,
  isAllClustersPage: boolean,
  clusterParam: string | undefined,
): string | undefined =>
  queryParams.get(CLUSTER_LIST_FILTER_PARAM) ??
  (isAllClustersPage ? ALL_CLUSTERS_KEY : clusterParam);

const getExportNamespace = (
  queryParams: URLSearchParams,
  activeNamespace: string | undefined,
): string =>
  queryParams.get(PROJECT_LIST_FILTER_PARAM) ?? activeNamespace ?? ALL_NAMESPACES_SESSION_KEY;

const useExportParams = (): ExportParams => {
  const queryParams = useQuery();
  const clusterParam = useClusterParam();
  const isAllClustersPage = useIsAllClustersPage();
  const activeNamespace = useActiveNamespace();

  const cluster = getExportCluster(queryParams, isAllClustersPage, clusterParam);
  const namespace = getExportNamespace(queryParams, activeNamespace);

  return { cluster, namespace };
};

export default useExportParams;
