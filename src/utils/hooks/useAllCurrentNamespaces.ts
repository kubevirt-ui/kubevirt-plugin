import { getName } from '@kubevirt-utils/resources/shared';
import useMulticlusterNamespaces from '@multicluster/hooks/useMulticlusterNamespaces';
import useIsACMPage from '@multicluster/useIsACMPage';

import { isEmpty } from '../utils/utils';

import useListNamespaces from './useListNamespaces';
import useProjects from './useProjects';

const useAllCurrentNamespaces = (clusters: string[]): string[] => {
  const isACMPage = useIsACMPage();

  const { allNamespaces: allNamespacesMulticluster } = useMulticlusterNamespaces(clusters);
  const [allNamespacesSingleCluster] = useProjects();
  const filteredNamespaces = useListNamespaces();

  if (!isACMPage) {
    return isEmpty(filteredNamespaces) ? allNamespacesSingleCluster : filteredNamespaces;
  }

  return allNamespacesMulticluster
    .filter((ns) => (isEmpty(filteredNamespaces) ? true : filteredNamespaces.includes(getName(ns))))
    .map(getName);
};

export default useAllCurrentNamespaces;
