import {
  PersistentVolumeClaimModel,
  VolumeSnapshotModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataImportCronModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineClusterPreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useListNamespaces from '@kubevirt-utils/hooks/useListNamespaces';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

type UseCanCreateBootableVolume = (namespace: string) => {
  canCreateDS: boolean;
  canCreatePVC: boolean;
  canCreateSnapshots: boolean;
  canListInstanceTypesPreference: boolean;
  loading: boolean;
};

const useCanCreateBootableVolume: UseCanCreateBootableVolume = (namespace) => {
  const selectedNamespaces = useListNamespaces();

  const clusterToVerifyAccess = useSelectedCluster();
  const namespaceToVerifyAccess = selectedNamespaces?.[0] || namespace;

  const [canCreatePVC, loadingPVC] = useFleetAccessReview({
    cluster: clusterToVerifyAccess,
    group: PersistentVolumeClaimModel.apiGroup,
    namespace: namespaceToVerifyAccess,
    resource: PersistentVolumeClaimModel.plural,
    verb: 'create' as K8sVerb,
  });
  const [canCreateSnapshots, loadingShapshots] = useFleetAccessReview({
    cluster: clusterToVerifyAccess,
    group: VolumeSnapshotModel.apiGroup,
    namespace: namespaceToVerifyAccess,
    resource: VolumeSnapshotModel.plural,
    verb: 'create' as K8sVerb,
  });

  const [canCreateDS, loadingDS] = useFleetAccessReview({
    cluster: clusterToVerifyAccess,
    group: DataSourceModel.apiGroup,
    namespace: namespaceToVerifyAccess,
    resource: DataSourceModel.plural,
    verb: 'create' as K8sVerb,
  });

  const [canCreateDIC, loadingDIC] = useFleetAccessReview({
    cluster: clusterToVerifyAccess,
    group: DataImportCronModel.apiGroup,
    namespace: namespaceToVerifyAccess,
    resource: DataImportCronModel.plural,
    verb: 'create' as K8sVerb,
  });

  const [canListInstanceTypesPreference, loadingInstanceTypesPreference] = useFleetAccessReview({
    cluster: clusterToVerifyAccess,
    group: VirtualMachineClusterPreferenceModel.apiGroup,
    resource: VirtualMachineClusterPreferenceModel.plural,
    verb: 'list' as K8sVerb,
  });

  return {
    canCreateDS: canCreateDS && canCreateDIC,
    canCreatePVC,
    canCreateSnapshots,
    canListInstanceTypesPreference,
    loading:
      loadingPVC || loadingDS || loadingDIC || loadingInstanceTypesPreference || loadingShapshots,
  };
};

export default useCanCreateBootableVolume;
