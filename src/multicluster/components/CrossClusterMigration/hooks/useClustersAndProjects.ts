import { useCallback, useMemo } from 'react';

import { type V1beta1Provider } from '@forklift-ui/types';
import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { ManagedClusterModel } from '@multicluster/constants';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';

import { getClusterFromProvider, getProviderByClusterName } from '../utils';

import useProviders from './useProviders';
import { getSelectableOptions } from './utils';

type UseClustersAndProjects = (
  sourceCluster: string,
  selectedClusterTarget: string,
) => {
  clustersError: Error | undefined;
  clustersLoaded: boolean;
  clustersOptions: EnhancedSelectOptionProps[];
  getProviderFromClusterName: (clusterName: string) => V1beta1Provider | undefined;
  projectOptions: EnhancedSelectOptionProps[];
  projectsError: Error | undefined;
  projectsLoaded: boolean;
  providers: V1beta1Provider[];
};

const useClustersAndProjects: UseClustersAndProjects = (sourceCluster, selectedClusterTarget) => {
  const [clusterNames, clustersLoaded, clustersError] = useFleetClusterNames() as [
    string[],
    boolean,
    Error | undefined,
  ];
  const [providers, providersLoaded, providersError] = useProviders();

  const selectableClusters = useMemo(
    () => clusterNames?.filter((clusterName) => clusterName !== sourceCluster),
    [clusterNames, sourceCluster],
  );

  const enabledClusters = useMemo(
    () =>
      providers
        ?.map((provider) => getName(provider))
        .filter((name): name is string => !!name)
        .map((name) => getClusterFromProvider(name)),
    [providers],
  );

  const clustersOptions = getSelectableOptions(
    selectableClusters,
    modelToGroupVersionKind(ManagedClusterModel),
    enabledClusters,
  );

  const [projects, projectsLoaded, projectsError] = useProjects(selectedClusterTarget);
  const projectOptions = getSelectableOptions(projects, modelToGroupVersionKind(ProjectModel));

  const getProviderFromClusterName = useCallback(
    (clusterName: string): V1beta1Provider | undefined =>
      getProviderByClusterName(clusterName, providers),
    [providers],
  );

  return {
    clustersError: (clustersError ?? providersError) as Error | undefined,
    clustersLoaded: clustersLoaded && providersLoaded,
    clustersOptions,
    getProviderFromClusterName,
    projectOptions,
    projectsError,
    projectsLoaded,
    providers,
  };
};

export default useClustersAndProjects;
