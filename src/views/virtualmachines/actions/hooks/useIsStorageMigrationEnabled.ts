import {
  modelToGroupVersionKind,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

const useIsStorageMigrationEnabled = () => {
  const [storageMigrationPlanModel] = useK8sModel(
    modelToGroupVersionKind(VirtualMachineStorageMigrationPlanModel),
  );

  return !isEmpty(storageMigrationPlanModel);
};

export default useIsStorageMigrationEnabled;
