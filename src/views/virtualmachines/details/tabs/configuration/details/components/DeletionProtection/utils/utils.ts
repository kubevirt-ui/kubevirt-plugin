import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel, getLabels } from '@kubevirt-utils/resources/shared';
import { updateLabels } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import { VM_DELETION_PROTECTION_LABEL } from './constants';

export const isDeletionProtectionEnabled = (vm: V1VirtualMachine) =>
  getLabel(vm, VM_DELETION_PROTECTION_LABEL, 'false') === 'true';

export const getDeletionProtectionPrintableStatus = (vm: V1VirtualMachine) => {
  const deletionProtectionEnabled = isDeletionProtectionEnabled(vm);
  return deletionProtectionEnabled ? t('Enabled') : t('Disabled');
};

export const setDeletionProtectionForVM = (
  vm: V1VirtualMachine,
  enableDeletionProtection: boolean,
) => {
  const vmLabels = getLabels(vm, {});
  vmLabels[VM_DELETION_PROTECTION_LABEL] = enableDeletionProtection.toString();
  return updateLabels(vm, vmLabels);
};
