import {
  IoK8sApiCoreV1Pod,
  IoK8sApiCoreV1Service,
} from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';

export const VMI_ID_LABEL = 'vmi.kubevirt.io/id';
export const VM_NAME_LABEL = 'vm.kubevirt.io/name';

/**
 * Get the label key-value pair to use for service selector
 * Priority: vmi.kubevirt.io/id (from pod) > vm.kubevirt.io/name (from pod) > VM name
 * @param pod - The virt-launcher pod (optional)
 * @param vm - The VirtualMachine
 */
export const getVMILabelForServiceSelector = (
  pod: IoK8sApiCoreV1Pod,
  vm: V1VirtualMachine,
): { labelKey: string; labelValue: string } => {
  const podLabels = pod?.metadata?.labels || {};
  const vmName = getName(vm);

  // Priority 1: Use vmi.kubevirt.io/id from pod (new KubeVirt >= v1.7)
  if (podLabels[VMI_ID_LABEL]) {
    return {
      labelKey: VMI_ID_LABEL,
      labelValue: podLabels[VMI_ID_LABEL],
    };
  }

  // Priority 2: Use vm.kubevirt.io/name from pod (fallback)
  if (podLabels[VM_NAME_LABEL]) {
    return {
      labelKey: VM_NAME_LABEL,
      labelValue: podLabels[VM_NAME_LABEL],
    };
  }

  // Priority 3: Fall back to VM name
  return {
    labelKey: VM_NAME_LABEL,
    labelValue: vmName,
  };
};

/**
 * Get services that match the VMI/pod labels
 * @param services - List of services to filter
 * @param pod - The virt-launcher pod (optional, for running VMs)
 * @param vm - The VirtualMachine (used as fallback)
 * @param vmi - The VirtualMachineInstance (optional, used as fallback when pod is not available)
 */
export const getServicesForVmi = (
  services: IoK8sApiCoreV1Service[],
  pod?: IoK8sApiCoreV1Pod,
  vm?: V1VirtualMachine,
  vmi?: V1VirtualMachineInstance,
): IoK8sApiCoreV1Service[] => {
  if (!services || services.length === 0) return [];

  // Get labels for matching
  // Priority: pod labels > VMI labels > VM template labels > VM name
  let labelsToMatch: { [key: string]: string } = {};

  if (pod?.metadata?.labels) {
    labelsToMatch = pod.metadata.labels;
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

  return services.filter((service) => {
    const selectors = service?.spec?.selector || {};
    if (Object.keys(selectors).length === 0) return false;

    // Check if service selector matches pod labels
    // Support both vmi.kubevirt.io/id and vm.kubevirt.io/name for backward compatibility
    return Object.keys(selectors).every((key) => {
      const selectorValue = selectors[key];
      const labelValue = labelsToMatch[key];

      // If selector uses vmi.kubevirt.io/id, check if pod has it or fallback to vm.kubevirt.io/name
      if (key === VMI_ID_LABEL) {
        return labelValue === selectorValue || labelsToMatch[VM_NAME_LABEL] === selectorValue;
      }

      // For all other labels (including vm.kubevirt.io/name), check exact match
      return labelValue === selectorValue;
    });
  });
};
