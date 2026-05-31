import { FLAG_STORAGE_MIGRATION_ENABLED } from '@kubevirt-utils/flags/consts';
import { VirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForModel,
  useFlag,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';

const useIsMTCInstalled = () => {
  const mtcInstalled = useFlag(FLAG_STORAGE_MIGRATION_ENABLED);
  const [vmsmpModel] = useK8sModel(
    getGroupVersionKindForModel(VirtualMachineStorageMigrationPlanModel),
  );

  return mtcInstalled && isEmpty(vmsmpModel);
};

export default useIsMTCInstalled;
