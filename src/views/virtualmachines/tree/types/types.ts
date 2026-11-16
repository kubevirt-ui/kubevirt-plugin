import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { type TreeViewDataItem } from '@patternfly/react-core';
import { type ClusterSetData } from '@stolostron/multicluster-sdk';

export type UseTreeViewDataResources = {
  clusterNames: string[];
  clusterSetData: ClusterSetData;
  clusterSetNames: string[];
  isACMTreeView: boolean;
  isTourRunning: boolean;
  loaded: boolean;
  loadError: unknown;
  namespacesByCluster: Record<string, K8sResourceCommon[]>;
  projectNames: string[];
  treeViewFoldersEnabled: boolean;
  vms: V1VirtualMachine[];
};

export type BuildParentTreeNodeArgs = {
  children: TreeViewDataItem[] | undefined;
  defaultExpanded: boolean;
  queryParams: string | undefined;
};
