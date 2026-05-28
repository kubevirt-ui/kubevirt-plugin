import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { DEFAULT_MTU, ProjectMappingOption } from '../../../views/vmnetworks/form/constants';

import {
  VM_NETWORK_CREATED,
  VM_NETWORK_MTU_CHANGED,
  VM_NETWORK_VLAN_ENABLED,
} from './utils/constants';
import { TELEMETRY_PROJECT_MAPPING_METHOD } from './utils/property-constants';
import { logEventWithName } from './telemetry';

const projectMappingMethodMap: Record<ProjectMappingOption, string> = {
  [ProjectMappingOption.AllProjects]: TELEMETRY_PROJECT_MAPPING_METHOD.ALL_PROJECTS,
  [ProjectMappingOption.SelectByLabels]: TELEMETRY_PROJECT_MAPPING_METHOD.LABEL_SELECTOR,
  [ProjectMappingOption.SelectFromList]: TELEMETRY_PROJECT_MAPPING_METHOD.SELECT_FROM_LIST,
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
