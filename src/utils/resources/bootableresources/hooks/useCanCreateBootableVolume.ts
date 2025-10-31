import { PersistentVolumeClaimModel, VolumeSnapshotModel } from '@kubevirt-ui/kubevirt-api/console';
import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import VirtualMachineClusterPreferenceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterPreferenceModel';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useListNamespaces from '@kubevirt-utils/hooks/useListNamespaces';
import { K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetAccessReview, useHubClusterName } from '@stolostron/multicluster-sdk';

type UseCanCreateBootableVolume = (namespace: string) => {
  canCreateDS: boolean;
  canCreatePVC: boolean;
  canCreateSnapshots: boolean;
  canListInstanceTypesPreference: boolean;
  loading: boolean;
};

const useCanCreateBootableVolume: UseCanCreateBootableVolume = (namespace) => {
  const selectedClusters = useListClusters();
  const selectedNamespaces = useListNamespaces();
  const [hubClusterName] = useHubClusterName();

  const clusterToVerifyAccess = selectedClusters?.[0] || hubClusterName;
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
