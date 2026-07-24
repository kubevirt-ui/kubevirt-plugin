import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  CLUSTER_LIST_FILTER_TYPE,
  PROJECT_LIST_FILTER_TYPE,
} from '@kubevirt-utils/utils/constants';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import useMulticlusterNamespaces from '@multicluster/hooks/useMulticlusterNamespaces';
import useIsACMPage from '@multicluster/useIsACMPage';

import { KubevirtFilter, KubevirtFilterLayout } from '../types';

type UseProjectFilterOptions = {
  /** When provided, overrides the default project list with these project names */
  allowedProjects?: string[];
};

const useProjectFilter = (options?: UseProjectFilterOptions): KubevirtFilter => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const selectedClusters = useListClusters(CLUSTER_LIST_FILTER_TYPE);

  const [projects] = useProjects();
  const { allNamespaces: multiclusterNamespaces } = useMulticlusterNamespaces(selectedClusters);

  const multiclusterNamespacesNames = useMemo(
    () =>
      multiclusterNamespaces
        ?.reduce((acc, project) => {
          const projectName = getName(project);
          if (!acc.includes(projectName)) {
            acc.push(projectName);
          }
          return acc;
        }, [] as string[])
        ?.sort((a, b) => universalComparator(a, b)) || [],
    [multiclusterNamespaces],
  );

  const projectNames = useMemo(() => {
    if (options?.allowedProjects) {
      return options.allowedProjects;
    }
    if (isACMPage) {
      return multiclusterNamespacesNames;
    }
    return projects ?? [];
  }, [options?.allowedProjects, isACMPage, multiclusterNamespacesNames, projects]);

  return useMemo(
    () => ({
      categoryLabel: t('Project'),
      filterLayout: KubevirtFilterLayout.SELECT,
      id: PROJECT_LIST_FILTER_TYPE,
      match: (obj, selected) => selected.includes(getNamespace(obj)),
      options: projectNames.map((project) => ({ label: project, value: project })),
    }),
    [projectNames, t],
  );
};

export default useProjectFilter;
