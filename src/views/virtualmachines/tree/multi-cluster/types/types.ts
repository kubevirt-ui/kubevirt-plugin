import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type UseMulticlusterNamespacesReturn } from '@multicluster/hooks/useMulticlusterNamespaces';
import { type TreeViewDataItem } from '@patternfly/react-core';
import { type ClusterSetData } from '@stolostron/multicluster-sdk';

export type CreateMultiClusterTreeViewDataArgs = {
  clusterNames?: string[];
  clusterSetData?: ClusterSetData;
  clusterSetNames?: string[];
  foldersEnabled: boolean;
  pathname: string;
  projectsByClusters: UseMulticlusterNamespacesReturn['namespacesByCluster'];
  queryParams?: string;
  vms: V1VirtualMachine[];
};

export type BuildMultiClusterTreeChildrenArgs = {
  clusterNames: string[] | undefined;
  clusterSetData: ClusterSetData | undefined;
  clusterSetNames: string[] | undefined;
  currentFolderName: string | undefined;
  currentVMTab: string;
  foldersEnabled: boolean;
  projectsByClusters: UseMulticlusterNamespacesReturn['namespacesByCluster'];
  queryParams: string | undefined;
  treeViewDataMap: Record<string, TreeViewDataItem>;
  vmCluster: string;
  vmName: string;
  vmNamespace: string;
  vmsPerCluster: Record<string, V1VirtualMachine[]>;
};
