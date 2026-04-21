import { IoK8sApiCoreV1Pod, IoK8sApiCoreV1Service } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';

export const VMI_ID_LABEL = 'vmi.kubevirt.io/id';
export const VM_NAME_LABEL = 'vm.kubevirt.io/name';

// Get the label key-value pair to use for service selector.
// Priority: vmi.kubevirt.io/id (from pod) > vm.kubevirt.io/name (from pod) > VM name
export const getVMILabelForServiceSelector = (
  pod: IoK8sApiCoreV1Pod,
  vm: V1VirtualMachine,
): { labelKey: string; labelValue: string } => {
  const podLabels = pod?.metadata?.labels || {};
  const vmName = getName(vm);

  if (podLabels[VMI_ID_LABEL]) {
    return {
      labelKey: VMI_ID_LABEL,
      labelValue: podLabels[VMI_ID_LABEL],
    };
  }

  if (podLabels[VM_NAME_LABEL]) {
    return {
      labelKey: VM_NAME_LABEL,
      labelValue: podLabels[VM_NAME_LABEL],
    };
  }

  return {
    labelKey: VM_NAME_LABEL,
    labelValue: vmName,
  };
};

// Get services that match the VMI/pod labels.
// Supports both vmi.kubevirt.io/id and vm.kubevirt.io/name for backward compatibility.
export const getServicesForVmi = (
  services: IoK8sApiCoreV1Service[],
  pod?: IoK8sApiCoreV1Pod,
  vm?: V1VirtualMachine,
  vmi?: V1VirtualMachineInstance,
): IoK8sApiCoreV1Service[] => {
  if (!services || services.length === 0) return [];

  let labelsToMatch: { [key: string]: string } = {};
  const podLabels = pod?.metadata?.labels;

  if (podLabels && Object.keys(podLabels).length > 0) {
    labelsToMatch = podLabels;
  } else if (vmi?.metadata?.labels) {
    labelsToMatch = vmi.metadata.labels;
  } else if (vm?.spec?.template?.metadata?.labels) {
    labelsToMatch = vm.spec.template.metadata.labels;
  } else if (vm) {
    labelsToMatch = {
      [VM_NAME_LABEL]: getName(vm),
    };
  } else {
    return [];
  }

  const vmiName = vmi?.metadata?.name;

  return services.filter((service) => {
    const selectors = service?.spec?.selector || {};
    if (Object.keys(selectors).length === 0) return false;

    return Object.keys(selectors).every((key) => {
      const selectorValue = selectors[key];
      const labelValue = labelsToMatch[key];

      if (key === VMI_ID_LABEL) {
        return labelValue === selectorValue || labelsToMatch[VM_NAME_LABEL] === selectorValue;
      }

      if (key === VM_NAME_LABEL && vmiName) {
        return labelValue === selectorValue || vmiName === selectorValue;
      }

      return labelValue === selectorValue;
    });
  });
};
