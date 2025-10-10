import { useMemo } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { PROJECT_LIST_FILTER_TYPE } from '@kubevirt-utils/utils/constants';
import { isEmpty, universalComparator } from '@kubevirt-utils/utils/utils';
import useMulticlusterNamespaces from '@multicluster/hooks/useMulticlusterNamespaces';
import useIsACMPage from '@multicluster/useIsACMPage';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import useSelectedRowFilterClusters from './useSelectedRowFilterClusters';

export const useProjectFilter = <R extends K8sResourceCommon>(): RowFilter<R> => {
  const allClustersSelected = useSelectedRowFilterClusters();
  const isACMPage = useIsACMPage();

  const [projects] = useProjects();
  const { allNamespaces: multiclusterNamespaces } = useMulticlusterNamespaces(allClustersSelected);

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

  const projectNames = isACMPage ? multiclusterNamespacesNames : projects;

  return {
    filter: (input, obj) => {
      if (isEmpty(input.selected)) {
        return true;
      }

      return input.selected.some((projectName) => projectName === getNamespace(obj));
    },
    filterGroupName: t('Project'),
    isMatch: () => true,
    items: projectNames.map((project) => ({
      id: project,
      title: project,
    })),
    type: PROJECT_LIST_FILTER_TYPE,
  };
};
