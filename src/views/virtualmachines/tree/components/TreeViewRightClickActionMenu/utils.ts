import { NavigateFunction } from 'react-router-dom-v5-compat';

import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel, getNamespace } from '@kubevirt-utils/resources/shared';
import { FOLDER_SELECTOR_PREFIX, VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';

export const getCreateVMAction = (
  navigate: NavigateFunction,
  namespace: string,
): ActionDropdownItemType => ({
  cta: () => navigate(`/k8s/ns/${namespace}/catalog`),
  id: 'create-vm',
  label: t('Create VirtualMachine'),
});

export const getElementComponentsFromID = (
  triggerElement: HTMLElement | null,
): { folderName: string; namespace: string; prefix: string } => {
  const [prefix, namespace, folderName] = triggerElement?.id?.split('/') || ['', '', ''];

  return { folderName, namespace, prefix };
};

export const getVMComponentsFromID = (
  triggerElement: HTMLElement | null,
): { vmName: string; vmNamespace: string } => {
  const [vmNamespace, vmName] = triggerElement?.id?.split('/') || ['', ''];
  return { vmName, vmNamespace };
};

export const getVMsTrigger = (triggerElement: HTMLElement | null) => {
  if (!triggerElement) return [];

  const { folderName, namespace, prefix } = getElementComponentsFromID(triggerElement);

  const namespaceVMs = vmsSignal?.value?.filter((resource) => getNamespace(resource) === namespace);

  if (prefix === FOLDER_SELECTOR_PREFIX && folderName)
    return namespaceVMs?.filter((resource) => getLabel(resource, VM_FOLDER_LABEL) === folderName);

  return namespaceVMs;
};
