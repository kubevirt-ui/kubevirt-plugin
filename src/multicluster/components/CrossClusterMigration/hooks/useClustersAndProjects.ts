import { useCallback, useMemo } from 'react';

import { V1beta1Provider } from '@kubev2v/types';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
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
  clustersError: any;
  clustersLoaded: boolean;
  clustersOptions: EnhancedSelectOptionProps[];
  getProviderFromClusterName: (clusterName: string) => V1beta1Provider;
  projectOptions: EnhancedSelectOptionProps[];
  projectsError: any;
  projectsLoaded: boolean;
  providers: V1beta1Provider[];
};

const useClustersAndProjects: UseClustersAndProjects = (sourceCluster, selectedClusterTarget) => {
  const [clusterNames, clustersLoaded, clustersError] = useFleetClusterNames();
  const [providers, providersLoaded, providersError] = useProviders();

  const selectableClusters = useMemo(() => {
    return clusterNames?.filter((clusterName) => clusterName !== sourceCluster);
  }, [clusterNames, sourceCluster]);

  const enabledClusters = useMemo(() => {
    return providers?.map((provider) => getClusterFromProvider(getName(provider)));
  }, [providers]);

  const clustersOptions = getSelectableOptions(
    selectableClusters,
    modelToGroupVersionKind(ManagedClusterModel),
    enabledClusters,
  );

  const [projects, projectsLoaded, projectsError] = useProjects(selectedClusterTarget);
  const projectOptions = getSelectableOptions(projects, modelToGroupVersionKind(ProjectModel));

  const getProviderFromClusterName = useCallback(
    (clusterName: string) => {
      return getProviderByClusterName(clusterName, providers);
    },
    [providers],
  );

  return {
    clustersError: clustersError || providersError,
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
