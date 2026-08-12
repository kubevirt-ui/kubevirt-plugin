import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { isDeletionProtectionEnabled } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import { isRunning } from '@virtualmachines/utils';

export const isBulkDeleteActionDisabled = (vms: V1VirtualMachine[]): boolean =>
  isEmpty(vms) || vms?.some(isRunning) || vms?.some(isDeletionProtectionEnabled);

export const getBulkDeleteActionDescription = (
  vms: V1VirtualMachine[],
  t: TFunction,
): string | undefined => {
  if (vms?.some(isRunning)) {
    return t('Some VirtualMachines are running');
  }

  if (vms?.some(isDeletionProtectionEnabled)) {
    return t('Some VirtualMachines are protected');
  }

  return undefined;
};
