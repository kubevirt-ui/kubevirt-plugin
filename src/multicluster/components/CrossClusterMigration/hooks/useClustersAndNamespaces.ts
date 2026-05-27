import { useCallback, useMemo } from 'react';

import { V1beta1Provider } from '@kubev2v/types';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import useNamespaces from '@kubevirt-utils/hooks/useNamespaces';
import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { ManagedClusterModel } from '@multicluster/constants';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';

import { getClusterFromProvider, getProviderByClusterName } from '../utils';

import useProviders from './useProviders';
import { getSelectableOptions } from './utils';

type UseClustersAndNamespaces = (
  sourceCluster: string,
  selectedClusterTarget: string,
) => {
  clustersError: any;
  clustersLoaded: boolean;
  clustersOptions: EnhancedSelectOptionProps[];
  getProviderFromClusterName: (clusterName: string) => V1beta1Provider;
  namespaceOptions: EnhancedSelectOptionProps[];
  namespacesError: any;
  namespacesLoaded: boolean;
  providers: V1beta1Provider[];
};

const useClustersAndNamespaces: UseClustersAndNamespaces = (sourceCluster, selectedClusterTarget) => {
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

  const [namespaces, namespacesLoaded, namespacesError] = useNamespaces(selectedClusterTarget);
  const namespaceOptions = getSelectableOptions(namespaces, modelToGroupVersionKind(NamespaceModel));

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
    namespaceOptions,
    namespacesError,
    namespacesLoaded,
    providers,
  };
};

export default useClustersAndNamespaces;
