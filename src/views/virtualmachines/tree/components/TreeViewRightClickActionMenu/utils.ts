import { NavigateFunction } from 'react-router-dom-v5-compat';

import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { getLabel, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { getCatalogURL } from '@multicluster/urls';
import { FOLDER_SELECTOR_PREFIX, VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';

export const getCreateVMAction = (
  navigate: NavigateFunction,
  namespace: string,
  cluster?: string,
): ActionDropdownItemType => ({
  cta: () => navigate(`${getCatalogURL(cluster, namespace)}`),
  id: 'create-vm',
  label: t('Create VirtualMachine'),
});

export const getElementComponentsFromID = (
  triggerElement: HTMLElement | null,
): { cluster?: string; folderName: string; namespace: string; prefix: string } => {
  const [prefix, cluster, namespace, folderName] = triggerElement?.id?.split('/') || [
    '',
    '',
    '',
    '',
  ];

  if (cluster === SINGLE_CLUSTER_KEY) return { folderName, namespace, prefix };

  return { cluster, folderName, namespace, prefix };
};

export const getVMComponentsFromID = (
  triggerElement: HTMLElement | null,
): { vmCluster?: string; vmName: string; vmNamespace: string } => {
  const [vmCluster, vmNamespace, vmName] = triggerElement?.id?.split('/') || ['', '', ''];

  if (vmCluster === SINGLE_CLUSTER_KEY) return { vmName, vmNamespace };

  return { vmCluster, vmName, vmNamespace };
};

export const getVMsTrigger = (triggerElement: HTMLElement | null) => {
  if (!triggerElement) return [];

  const { cluster, folderName, namespace, prefix } = getElementComponentsFromID(triggerElement);

  const namespaceVMs = vmsSignal?.value?.filter(
    (resource) => getNamespace(resource) === namespace && getCluster(resource) === cluster, // TODO: check if this is correct
  );

  if (prefix === FOLDER_SELECTOR_PREFIX && folderName)
    return namespaceVMs?.filter((resource) => getLabel(resource, VM_FOLDER_LABEL) === folderName);

  return namespaceVMs;
};
