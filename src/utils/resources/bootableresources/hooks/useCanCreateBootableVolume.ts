import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

type UseCanCreateBootableVolume = (namespace: string) => {
  canCreateDS: boolean;
  canCreatePVC: boolean;
  loading: boolean;
};

const useCanCreateBootableVolume: UseCanCreateBootableVolume = (namespace) => {
  const [canCreatePVC, loadingPVC] = useAccessReview({
    group: PersistentVolumeClaimModel.apiGroup,
    namespace: namespace,
    resource: PersistentVolumeClaimModel.plural,
    verb: 'create' as K8sVerb,
  });

  const [canCreateDS, loadingDS] = useAccessReview({
    group: DataSourceModel.apiGroup,
    namespace: namespace,
    resource: DataSourceModel.plural,
    verb: 'create' as K8sVerb,
  });

  const [canCreateDIC, loadingDIC] = useAccessReview({
    group: DataImportCronModel.apiGroup,
    namespace: namespace,
    resource: DataImportCronModel.plural,
    verb: 'create' as K8sVerb,
  });

  return {
    canCreateDS: canCreateDS && canCreateDIC,
    canCreatePVC,
    loading: loadingPVC || loadingDS || loadingDIC,
  };
};

export default useCanCreateBootableVolume;
