import { type TFunction } from 'i18next';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isConflictError } from '@kubevirt-utils/errors/errorTypes';
import { getName } from '@kubevirt-utils/resources/shared';
import { updateVM as persistVM } from '@kubevirt-utils/resources/vm/utils/update';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

import { type CloudIdentityProvider } from '../types/types';
import { updateVM } from './vm';

type UpdatePersistedVMParams = {
  cluster?: string;
  namespace: string;
  provider?: CloudIdentityProvider;
  serviceAccountName?: string;
  t: TFunction;
  vm: V1VirtualMachine;
};

export const updatePersistedVM = async ({
  cluster,
  namespace,
  provider,
  serviceAccountName,
  t,
  vm,
}: UpdatePersistedVMParams): Promise<V1VirtualMachine> => {
  const latestVM = await kubevirtK8sGet<V1VirtualMachine>({
    cluster,
    model: VirtualMachineModel,
    name: getName(vm),
    ns: namespace,
  });

  try {
    return await persistVM(updateVM(latestVM, { provider, serviceAccountName }));
  } catch (error) {
    if (isConflictError(error)) {
      throw new Error(
        t('The VirtualMachine configuration is still being updated. Wait a moment and try again.'),
      );
    }

    throw error;
  }
};
