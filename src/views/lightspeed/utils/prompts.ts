import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { isErrorPrintableStatus } from '@virtualmachines/utils';

export enum OLSPromptType {
  ACCESS_MODE = 'ACCESS_MODE',
  ANNOTATIONS = 'ANNOTATIONS',
  AUTO_IMAGE_DOWNLOADS = 'AUTO_IMAGE_DOWNLOADS',
  CONFIGURATION_FEATURE = 'CONFIGURATION_FEATURE',
  CONFIRM_VM_ACTIONS = 'CONFIRM_VM_ACTIONS',
  CPU_MEMORY = 'CPU_MEMORY',
  DELETION_PROTECTION = 'DELETION_PROTECTION',
  DESCHEDULER = 'DESCHEDULER',
  DYNAMIC_SSH_KEY_INJECTION = 'DYNAMIC_SSH_KEY_INJECTION',
  ENABLE_MEMORY_DENSITY = 'ENABLE_MEMORY_DENSITY',
  ENABLE_PASST_BINDING = 'ENABLE_PASST_BINDING',
  ENABLE_PERSISTENT_RESERVATION = 'ENABLE_PERSISTENT_RESERVATION',
  ENABLE_PREALLOCATION = 'ENABLE_PREALLOCATION',
  FILE_SYSTEMS = 'FILE_SYSTEMS',
  GUEST_LOGIN_CREDENTIALS = 'GUEST_LOGIN_CREDENTIALS',
  GUEST_SYSTEM_LOG_ACCESS = 'GUEST_SYSTEM_LOG_ACCESS',
  HEADLESS_MODE = 'HEADLESS_MODE',
  HIGH_AVAILABILITY_FEATURE = 'HIGH_AVAILABILITY_FEATURE',
  KERNEL_SAMEPAGE_MERGING = 'KERNEL_SAMEPAGE_MERGING',
  LABELS = 'LABELS',
  LOAD_BALANCE = 'LOAD_BALANCE',
  MACHINE_TYPE = 'MACHINE_TYPE',
  NAMESPACE = 'NAMESPACE',
  OWNER = 'OWNER',
  PREFERENCE = 'PREFERENCE',
  PREVIEW_FEATURES = 'PREVIEW_FEATURES',
  SET_SCSI_RESERVATION_FOR_DISK = 'SET_SCSI_RESERVATION_FOR_DISK',
  SHARE_THIS_DISK_BETWEEN_MULTI_VMS = 'SHARE_THIS_DISK_BETWEEN_MULTI_VMS',
  SSH_OVER_LOADBALANCER_SERVICE = 'SSH_OVER_LOADBALANCER_SERVICE',
  SSH_OVER_NODEPORT_SERVICE = 'SSH_OVER_NODEPORT_SERVICE',
  SSH_USING_VIRTCTL = 'SSH_USING_VIRTCTL',
  STATUS_CONDITIONS = 'STATUS_CONDITIONS',
  VIRTCTL = 'VIRTCTL',
  VM_STATUS = 'VM_STATUS',
  VM_STATUS_CONCISE = 'VM_STATUS_CONCISE',
  VOLUME_MODE = 'VOLUME_MODE',
  VOLUME_SNAPSHOT_STATUS = 'VOLUME_SNAPSHOT_STATUS',
}

type PromptData = {
  vm?: V1VirtualMachine;
};

export const getOLSPrompt = (promptType: OLSPromptType, data?: PromptData): string => {
  const vm = data?.vm;
  const vmPrintableStatus = getVMStatus(vm);
  const isErrorStatus = isErrorPrintableStatus(vmPrintableStatus);

  const olsPrompts = {
    [OLSPromptType.ACCESS_MODE]:
      'Provide a detailed explanation of access modes in the context of OpenShift Virtualization storage.',
    [OLSPromptType.ANNOTATIONS]:
      'Provide a detailed explanation of annotations in the context of OpenShift Virtualization and provide common uses.',
    [OLSPromptType.AUTO_IMAGE_DOWNLOADS]:
      'Provide a detailed explanation of the automatic images download feature in OpenShift Virtualization.',
    [OLSPromptType.CONFIGURATION_FEATURE]:
      'Provide a detailed explanation of configuration options for VirtualMachines in OpenShift Virtualization.',
    [OLSPromptType.CONFIRM_VM_ACTIONS]:
      'Provide a detailed explanation of the confirm VirtualMachine actions feature in OpenShift Virtualization.',
    [OLSPromptType.CPU_MEMORY]:
      'Provide a detailed explanation of CPU and memory settings for VirtualMachines in OpenShift Virtualization.',
    [OLSPromptType.DELETION_PROTECTION]:
      'Provide a detailed explanation of the VirtualMachine deletion protection feature in OpenShift Virtualization.',
    [OLSPromptType.DESCHEDULER]:
      'Provide a detailed explanation of the function of the descheduler in OpenShift Virtualization.',
    [OLSPromptType.DYNAMIC_SSH_KEY_INJECTION]:
      'Provide a detailed explanation of dynamic SSH key injection in OpenShift Virtualization.',
    [OLSPromptType.ENABLE_MEMORY_DENSITY]:
      'Provide a detailed explanation of memory density in OpenShift Virtualization.',
    [OLSPromptType.ENABLE_PASST_BINDING]:
      'Provide a detailed explanation of passt binding for primary user-defined networks in OpenShift Virtualization.',
    [OLSPromptType.ENABLE_PERSISTENT_RESERVATION]:
      'Provide a detailed explanation of persistent SCSI reservation for VirtualMachine disks in OpenShift Virtualization.',
    [OLSPromptType.ENABLE_PREALLOCATION]:
      'Provide a detailed explanation of preallocation in OpenShift Virtualization.',
    [OLSPromptType.FILE_SYSTEMS]:
      'Provide a detailed explanation of file systems in the context of VirtualMachines in OpenShift Virtualization.',
    [OLSPromptType.GUEST_LOGIN_CREDENTIALS]:
      'Provide a detailed explanation of the use of guest login credentials in OpenShift Virtualization.',
    [OLSPromptType.GUEST_SYSTEM_LOG_ACCESS]:
      'Provide a detailed explanation of guest system log access in the context of OpenShift Virtualization.',
    [OLSPromptType.HEADLESS_MODE]:
      'Provide a detailed explanation of headless mode in the context of OpenShift Virtualization.',
    [OLSPromptType.HIGH_AVAILABILITY_FEATURE]:
      'Provide a detailed explanation of high availability in the context of OpenShift Virtualization.',
    [OLSPromptType.KERNEL_SAMEPAGE_MERGING]:
      'Provide a detailed explanation of kernel samepage merging (KSM) in OpenShift Virtualization.',
    [OLSPromptType.LABELS]:
      'Provide a detailed explanation of labels in the context of OpenShift Virtualization and provide common uses.',
    [OLSPromptType.LOAD_BALANCE]:
      'Provide a detailed explanation of load balancing in the context of OpenShift Virtualization.',
    [OLSPromptType.MACHINE_TYPE]:
      'Provide a detailed explanation of the QEMU machine type in the context of OpenShift Virtualization.',
    [OLSPromptType.NAMESPACE]:
      'Provide a detailed explanation of namespaces in the context of OpenShift and OpenShift Virtualization.',
    [OLSPromptType.OWNER]:
      'Provide a detailed explanation of ownerReferences in VirtualMachine resources.',
    [OLSPromptType.PREFERENCE]:
      'Provide a detailed explanation of Preferences in the context of OpenShift Virtualization.',
    [OLSPromptType.PREVIEW_FEATURES]:
      'Provide a detailed explanation of preview features in the context of OpenShift Virtualization.',
    [OLSPromptType.SET_SCSI_RESERVATION_FOR_DISK]:
      'Provide a detailed explanation of SCSI disk reservations in the context of OpenShift Virtualization.',
    [OLSPromptType.SHARE_THIS_DISK_BETWEEN_MULTI_VMS]:
      'Provide a detailed explanation of the capability to share disks between multiple VirtualMachines in OpenShift Virtualization.',
    [OLSPromptType.SSH_OVER_LOADBALANCER_SERVICE]:
      'Provide a detailed explanation of LoadBalancer services for SSH connections in OpenShift Virtualization.',
    [OLSPromptType.SSH_OVER_NODEPORT_SERVICE]:
      'Provide a detailed explanation of NodePort services for SSH connections in OpenShift Virtualization.',
    [OLSPromptType.SSH_USING_VIRTCTL]:
      'Provide a detailed explanation with examples of connecting to a VirtualMachine via the command line using SSH through virtctl.',
    [OLSPromptType.STATUS_CONDITIONS]:
      'Provide a detailed explanation of VirtualMachine status conditions in OpenShift Virtualization.',
    [OLSPromptType.VIRTCTL]:
      'Provide a detailed explanation with examples of virtctl in the context of OpenShift Virtualization.',
    [OLSPromptType.VM_STATUS]: `Provide a detailed explanation for why a VirtualMachine would have a status of ${vmPrintableStatus}${
      isErrorStatus ? 'and provide troubleshooting steps for how to fix it' : ''
    }.`,
    [OLSPromptType.VM_STATUS_CONCISE]: `Provide a very concise explanation for why a VirtualMachine would have a status of ${vmPrintableStatus}. Don't provide troubleshooting steps and don't add phrases indicating that this response is intended to brief. Attempt to limit the response to no more than two sentences`,
    [OLSPromptType.VOLUME_MODE]:
      'Provide a detailed explanation of volume modes in the context of OpenShift Virtualization storage.',
    [OLSPromptType.VOLUME_SNAPSHOT_STATUS]:
      'Provide a detailed explanation of volume snapshot status in the context of OpenShift Virtualization storage.',
  };

  return olsPrompts[promptType];
};
