import { VirtualMachineModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { RESTART_REQUIRED } from '@kubevirt-utils/components/PendingChanges/utils/constants';
import {
  VirtualMachineConfigurationTabInner,
  VirtualMachineDetailsTab,
} from '@kubevirt-utils/constants/tabs-constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getStatusConditions } from '@kubevirt-utils/resources/vm';

import { type PendingChange } from './types';

export * from './computeChanges';
export * from './configChanges';
export * from './hardwareChanges';
export * from './networkChanges';
export * from './schedulingChanges';
export * from './storageChanges';

export const getTabURL = (vm: V1VirtualMachine, tab: VirtualMachineDetailsTab): string => {
  const tabPath = VirtualMachineConfigurationTabInner.has(tab)
    ? `${VirtualMachineDetailsTab.Configurations}/${tab}`
    : tab;
  return `/k8s/ns/${getNamespace(vm)}/${VirtualMachineModelRef}/${getName(vm)}/${tabPath}`;
};

export const getPendingChangesByTab = (
  pendingChanges: PendingChange[],
  tab: VirtualMachineDetailsTab,
): PendingChange[] => {
  return pendingChanges?.filter((change) => change?.tab === tab && change?.hasPendingChange) ?? [];
};

export const restartRequired = (vm: V1VirtualMachine): boolean =>
  getStatusConditions(vm).some(
    (condition) => condition?.type === RESTART_REQUIRED && condition?.status === 'True',
  );
