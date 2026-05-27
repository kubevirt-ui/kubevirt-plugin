import { DEFAULT_MTU, NamespaceMappingOption } from 'src/views/vmnetworks/form/constants';

import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  VM_NETWORK_CREATED,
  VM_NETWORK_MTU_CHANGED,
  VM_NETWORK_VLAN_ENABLED,
} from './utils/constants';
import { logEventWithName } from './telemetry';

const namespaceMappingMethodMap: Record<NamespaceMappingOption, string> = {
  [NamespaceMappingOption.AllNamespaces]: 'all_namespaces',
  [NamespaceMappingOption.SelectByLabels]: 'label_selector',
  [NamespaceMappingOption.SelectFromList]: 'select_from_list',
};

export const logVMNetworkCreated = (
  resource: { spec?: any } & K8sResourceCommon,
  namespaceMappingOption: NamespaceMappingOption,
) => {
  logEventWithName(VM_NETWORK_CREATED, {
    namespaceMappingMethod: namespaceMappingMethodMap[namespaceMappingOption],
  });

  const localnet = resource?.spec?.network?.localnet;

  if (!isEmpty(localnet?.vlan)) {
    logEventWithName(VM_NETWORK_VLAN_ENABLED, { vlanId: localnet.vlan.access?.id });
  }

  if (localnet?.mtu && localnet.mtu !== DEFAULT_MTU) {
    logEventWithName(VM_NETWORK_MTU_CHANGED, { mtuValue: localnet.mtu });
  }
};
