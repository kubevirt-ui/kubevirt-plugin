import { InstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { isValidVMName } from '@kubevirt-utils/components/VMNameValidationHelperText/utils/utils';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const getDisableButtonTooltipContent = (
  instanceTypeVMStore: InstanceTypeVMStore,
  canCreate: boolean,
) => {
  const {
    instanceTypeVMState: { selectedBootableVolume, selectedInstanceType, vmName },
    vmNamespaceTarget,
  } = instanceTypeVMStore;

  const noBootableVolumeCreated = isEmpty(selectedBootableVolume);

  const isValidVmName = isValidVMName(vmName);

  if (noBootableVolumeCreated) return t('A boot volume must be selected');
  if (isEmpty(vmName)) return t('VirtualMachine name field is mandatory');
  if (isEmpty(selectedInstanceType)) return t('An InstanceType must be selected');
  if (!isValidVmName) return t('VirtualMachine name not valid');

  if (!canCreate)
    return t(
      'Ask your cluster administrator for access permissions or select a different project (current project: {{currentNamespace}})',
      { currentNamespace: vmNamespaceTarget },
    );
};
