import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getLabels, getName } from '@kubevirt-utils/resources/shared';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { eventMonitor } from './telemetry';
import { VM_LABELS_COLLECTED } from './utils/constants';

export const logVMLabelsCollected = (vm: V1VirtualMachine): void => {
  const labels = getLabels(vm) ?? {};
  eventMonitor(VM_LABELS_COLLECTED, {
    labelCount: Object.keys(labels).length,
    vmName: getName(vm),
  });
};

export const logVMLabelsCollectedIfVirtualMachine = (
  obj: K8sResourceCommon,
  updatedLabels: Record<string, string>,
): void => {
  if (obj?.kind !== VirtualMachineModel.kind) {
    return;
  }

  logVMLabelsCollected({
    ...obj,
    metadata: { ...obj.metadata, labels: updatedLabels },
  } as V1VirtualMachine);
};
