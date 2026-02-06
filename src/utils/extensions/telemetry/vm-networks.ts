import { DEFAULT_MTU, ProjectMappingOption } from 'src/views/vmnetworks/form/constants';

import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  VM_NETWORK_CREATED,
  VM_NETWORK_MTU_CHANGED,
  VM_NETWORK_VLAN_ENABLED,
} from './utils/constants';
import { logEventWithName } from './telemetry';

const projectMappingMethodMap: Record<ProjectMappingOption, string> = {
  [ProjectMappingOption.AllProjects]: 'all_projects',
  [ProjectMappingOption.SelectByLabels]: 'label_selector',
  [ProjectMappingOption.SelectFromList]: 'select_from_list',
};

export const logVMNetworkCreated = (
  resource: { spec?: any } & K8sResourceCommon,
  projectMappingOption: ProjectMappingOption,
) => {
  logEventWithName(VM_NETWORK_CREATED, {
    projectMappingMethod: projectMappingMethodMap[projectMappingOption],
  });

  const localnet = resource?.spec?.network?.localnet;

  if (!isEmpty(localnet?.vlan)) {
    logEventWithName(VM_NETWORK_VLAN_ENABLED, { vlanId: localnet.vlan.access?.id });
  }

  if (localnet?.mtu && localnet.mtu !== DEFAULT_MTU) {
    logEventWithName(VM_NETWORK_MTU_CHANGED, { mtuValue: localnet.mtu });
  }
};
