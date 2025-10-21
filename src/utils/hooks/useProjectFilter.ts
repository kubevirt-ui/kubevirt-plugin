import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { PROJECT_LIST_FILTER_TYPE } from '@kubevirt-utils/utils/constants';
import { isEmpty, universalComparator } from '@kubevirt-utils/utils/utils';
import useMulticlusterNamespaces from '@multicluster/hooks/useMulticlusterProjects';
import useIsACMPage from '@multicluster/useIsACMPage';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import useSelectedRowFilterClusters from './useSelectedRowFilterClusters';

export const useProjectFilter = (): RowFilter<V1VirtualMachine> => {
  const allClustersSelected = useSelectedRowFilterClusters();
  const isACMPage = useIsACMPage();

  const [projects] = useProjects();
  const { allNamespaces: multiclusterProjects } = useMulticlusterNamespaces(allClustersSelected);

  const multiclusterProjectsNames = useMemo(
    () =>
      multiclusterProjects
        ?.reduce((acc, project) => {
          const projectName = getName(project);
          if (!acc.includes(projectName)) {
            acc.push(projectName);
          }
          return acc;
        }, [] as string[])
        ?.sort((a, b) => universalComparator(a, b)) || [],
    [multiclusterProjects],
  );

  const projectNames = isACMPage ? multiclusterProjectsNames : projects;

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
