import { MultiNamespaceVirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getGroupVersionKindForModel, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

import useIsMTCInstalled from './useIsMTCInstalled';

const useShouldUseMtcMigration = (): boolean => {
  const mtcInstalled = useIsMTCInstalled();
  const [vmsmpModel] = useK8sModel(
    getGroupVersionKindForModel(MultiNamespaceVirtualMachineStorageMigrationPlanModel),
  );

  const nativeCRDAvailable = !isEmpty(vmsmpModel);

  return mtcInstalled && !nativeCRDAvailable;
};

export default useShouldUseMtcMigration;
