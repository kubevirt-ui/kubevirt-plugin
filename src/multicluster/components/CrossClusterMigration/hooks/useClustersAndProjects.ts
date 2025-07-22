import { useMemo } from 'react';

import useProjects from '@kubevirt-utils/hooks/useProjects';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { ManagedClusterModel } from '@multicluster/constants';
import useAllClusters from '@multicluster/hooks/useAllClusters/useAllClusters';

import { getSelectableOptions } from './utils';

const useClustersAndProjects = (sourceCluster: string, selectedClusterTarget: string) => {
  const [clusters, clustersLoaded, clustersError] = useAllClusters();

  const clustersNames = useMemo(() => {
    return clusters?.map((cluster) => getName(cluster));
  }, [clusters]);

  const selectableClusters = useMemo(() => {
    return clustersNames?.filter((clusterName) => clusterName !== sourceCluster);
  }, [clustersNames, sourceCluster]);

  const clustersOptions = getSelectableOptions(
    selectableClusters,
    modelToGroupVersionKind(ManagedClusterModel),
  );

  const [projects, projectsLoaded, projectsError] = useProjects(selectedClusterTarget);
  const projectOptions = getSelectableOptions(projects, modelToGroupVersionKind(ProjectModel));

  return {
    clustersError,
    clustersLoaded,
    clustersOptions,
    projectOptions,
    projectsError,
    projectsLoaded,
  };
};

export default useClustersAndProjects;
