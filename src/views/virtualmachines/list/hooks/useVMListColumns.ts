import { NodeModel, VirtualMachineModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { KUBEVIRT_APISERVER_PROXY } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { type K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

import { type VMCallbacks } from '../virtualMachinesDefinition';

import { type PVCMapper, type VMIMapper, type VMIMMapper } from '../../utils/mappers';
import useVirtualMachineListColumnUtils from './useVirtualMachineListColumnUtils';
import useVirtualMachineListColumns from './useVirtualMachinesListColumns';

type VMListColumnsResult = {
  activeColumnKeys: string[];
  callbacks: VMCallbacks;
  columnLayout: ReturnType<typeof useVirtualMachineListColumns>['columnLayout'];
  columns: ReturnType<typeof useVirtualMachineListColumns>['columns'];
  loaded: boolean;
  pvcMapper: PVCMapper;
  vmiMapper: VMIMapper;
  vmimMapper: VMIMMapper;
};

export const useVMListColumns = (namespace: string, cluster?: string): VMListColumnsResult => {
  const isAllClustersPage = useIsAllClustersPage();
  const { loading: loadingFeatureProxy } = useFeatures(KUBEVIRT_APISERVER_PROXY);

  const [canGetNode] = useFleetAccessReview({
    cluster,
    namespace,
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  const {
    callbacks,
    loaded: columnUtilsLoaded,
    pvcMapper,
    vmiMapper,
    vmimMapper,
  } = useVirtualMachineListColumnUtils(cluster, namespace);

  const { activeColumnKeys, columnLayout, columns, loadedColumns } = useVirtualMachineListColumns(
    VirtualMachineModelRef,
    namespace,
    isAllClustersPage,
    canGetNode,
  );

  return {
    activeColumnKeys,
    callbacks,
    columnLayout,
    columns,
    loaded: columnUtilsLoaded && !loadingFeatureProxy && loadedColumns,
    pvcMapper,
    vmiMapper,
    vmimMapper,
  };
};
