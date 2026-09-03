// Extracted from prompts.ts
// Root: src/views/lightspeed/utils/prompts.ts

import { OLSPromptType } from './promptTypes';

export const STATIC_PROMPT_MESSAGES_A: Partial<Record<OLSPromptType, string>> = {
  [OLSPromptType.AAQ_QUOTA_CALCULATION_METHOD]:
    'Provide a detailed explanation of the quota calculation method for AAQ in OpenShift Virtualization.',
  [OLSPromptType.ACCESS_MODE]:
    'Provide a detailed explanation of access modes in the context of OpenShift Virtualization storage.',
  [OLSPromptType.ACTIVATION_KEY]:
    'Provide a detailed explanation of Subscription activation keys in the context of OpenShift Virtualization.',
  [OLSPromptType.ADVANCED_CDROM_FEATURES]:
    'Provide a detailed explanation of the advanced CD-ROM features in OpenShift Virtualization.',
  [OLSPromptType.ANNOTATIONS]:
    'Provide a detailed explanation of annotations in the context of OpenShift Virtualization and provide common uses.',
  [OLSPromptType.APPLICATION_AWARE_QUOTA]:
    'Provide a detailed explanation of application aware quota in OpenShift Virtualization.',
  [OLSPromptType.AUTO_IMAGE_DOWNLOADS]:
    'Provide a detailed explanation of the automatic images download feature in OpenShift Virtualization.',
  [OLSPromptType.BOOT_FROM_CD]:
    'Provide a detailed explanation of booting from a CD in the context of OpenShift Virtualization.',
  [OLSPromptType.BOOT_VOLUME_FOR_INSTANCETYPE_VM]:
    'Provide a detailed explanation of bootable volumes and how they relate to instance types in the context of OpenShift Virtualization.',
  [OLSPromptType.BOOTABLE_VOLUME_ARCHITECTURES]:
    'Provide a detailed explanation of supported architectures in relation to bootable volumes in OpenShift Virtualization.',
  [OLSPromptType.BOOTABLE_VOLUME_METADATA]:
    'Provide a detailed explanation of the metadata values used to turn a volume into a bootable volume in OpenShift Virtualization including the Preference, InstanceType, and Architecture.',
  [OLSPromptType.CLONE_VOLUME]:
    'Provide a detailed explanation of cloning volumes in OpenShift Virtualization.',
  [OLSPromptType.CLOUDINIT_IP_ADDRESSES]:
    'Provide a detailed explanation of the formatting and usage of IP addresses in cloudinit in the context of OpenShift Virtualization.',
  [OLSPromptType.CONFIGURATION_FEATURE]:
    'Provide a detailed explanation of configuration options for VirtualMachines in OpenShift Virtualization.',
  [OLSPromptType.CONFIRM_VM_ACTIONS]:
    'Provide a detailed explanation of the confirm VirtualMachine actions feature in OpenShift Virtualization.',
  [OLSPromptType.CPU_ALLOCATION]:
    'Provide a detailed explanation of CPU allocation in OpenShift Virtualization.',
  [OLSPromptType.CPU_MEMORY]:
    'Provide a detailed explanation of CPU and memory settings for VirtualMachines in OpenShift Virtualization.',
  [OLSPromptType.DATAVOLUME_STATUS]:
    'Provide a detailed explanation of the DataVolume status in OpenShift Virtualization.',
  [OLSPromptType.DEFAULT_INSTANCETYPE]:
    'Provide a detailed explanation of the default InstanceType for a volume in OpenShift Virtualization.',
  [OLSPromptType.DEFAULT_NETWORK]:
    'Provide a detailed explanation of the default network in OpenShiftShift Virtualization.',
  [OLSPromptType.DEFAULT_TEMPLATES]:
    'Provide a detailed explanation of default Templates in OpenShift Virtualization.',
  [OLSPromptType.DELETION_PROTECTION]:
    'Provide a detailed explanation of the VirtualMachine deletion protection feature in OpenShift Virtualization.',
  [OLSPromptType.DESCHEDULER]:
    'Provide a detailed explanation of the function of the descheduler in OpenShift Virtualization.',
  [OLSPromptType.DESCHEDULER_THRESHOLDS]:
    'Provide a detailed explanation of descheduler thresholds in OpenShift Virtualization.',
  [OLSPromptType.DESCRIPTION]:
    'Provide a detailed explanation of the metadata.description field in the context of OpenShift and OpenShift Virtualization.',
  [OLSPromptType.DISK_SOURCE]:
    'Provide a detailed explanation of disk sources for boot disks in OpenShift Virtualization.',
  [OLSPromptType.DYNAMIC_SSH_KEY_INJECTION]:
    'Provide a detailed explanation of dynamic SSH key injection in OpenShift Virtualization.',
  [OLSPromptType.ENABLE_GUEST_SYSTEM_LOG_ACCESS]:
    'Provide a detailed explanation of what it means to enable guest system log access in OpenShift Virtualization.',
  [OLSPromptType.ENABLE_MEMORY_DENSITY]:
    'Provide a detailed explanation of memory density in OpenShift Virtualization.',
  [OLSPromptType.ENABLE_PASST_BINDING]:
    'Provide a detailed explanation of passt binding for primary user-defined networks in OpenShift Virtualization.',
  [OLSPromptType.ENABLE_PERSISTENT_RESERVATION]:
    'Provide a detailed explanation of persistent SCSI reservation for VirtualMachine disks in OpenShift Virtualization.',
  [OLSPromptType.ENABLE_PREALLOCATION]:
    'Provide a detailed explanation of preallocation in OpenShift Virtualization.',
  [OLSPromptType.ENVIRONMENT_VARS]:
    'Explain the process of adding environment variables to a VirtualMachine from existing ConfigMaps, Secrets, or ServiceAccounts as disks in OpenShiftVirtualization.',
  [OLSPromptType.FENCE_AGENTS_REMEDIATION_OPERATOR_ALTERNATIVES]:
    'Explain options for alternative operators for the Fence Agents Remediation operator.',
  [OLSPromptType.FILE_SYSTEMS]:
    'Provide a detailed explanation of file systems in the context of VirtualMachines in OpenShift Virtualization.',
  [OLSPromptType.GUEST_LOGIN_CREDENTIALS]:
    'Provide a detailed explanation of the use of guest login credentials in OpenShift Virtualization.',
  [OLSPromptType.GUEST_SYSTEM_LOG_ACCESS]:
    'Provide a detailed explanation of guest system log access in the context of OpenShift Virtualization.',
};
