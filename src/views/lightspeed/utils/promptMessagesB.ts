// Extracted from prompts.ts
// Root: src/views/lightspeed/utils/prompts.ts

import { OLSPromptType } from './promptTypes';

export const STATIC_PROMPT_MESSAGES_B: Partial<Record<OLSPromptType, string>> = {
  [OLSPromptType.GUIDED_TOUR]:
    'Provide a detailed explanation of the guided tour feature in OpenShift Virtualization.',
  [OLSPromptType.HEADLESS_MODE]:
    'Provide a detailed explanation of headless mode in the context of OpenShift Virtualization.',
  [OLSPromptType.HIDE_GUEST_CREDENTIALS_FOR_NON_PRIV_USERS]:
    'Provide a detailed explanation of what it means to hide guest credentials for non-privileged users in OpenShift Virtualization.',
  [OLSPromptType.HIDE_YAML_TAB]:
    'Explain the use of the YAML tab in OpenShift Virtualization and reasons why an admin user may want to hide it from non-privileged users.',
  [OLSPromptType.HIGH_AVAILABILITY_FEATURE]:
    'Provide a detailed explanation of high availability in the context of OpenShift Virtualization.',
  [OLSPromptType.HUGEPAGES]:
    'Provide a detailed explanation of Hugepages in OpenShift Virtualization.',
  [OLSPromptType.KERNEL_SAMEPAGE_MERGING]:
    'Provide a detailed explanation of kernel samepage merging (KSM) in OpenShift Virtualization.',
  [OLSPromptType.KUBE_DESCHEDULER_OPERATOR_ALTERNATIVES]:
    'Explain options for alternative operators for the Kube Descheduler operator.',
  [OLSPromptType.LABELS]:
    'Provide a detailed explanation of labels in the context of OpenShift Virtualization and provide common uses.',
  [OLSPromptType.LIVE_MIGRATION]:
    'Provide a detailed explanation of the live migration process for VirtualMachines in OpenShift Virtualization.',
  [OLSPromptType.LIVE_MIGRATION_DATA_TRANSFER_RATE]:
    'Provide a detailed explanation of data throughput in relation to the live migration of VirtualMachines in OpenShift Virtualization and the factors that affect it.',
  [OLSPromptType.LOAD_BALANCE]:
    'Provide a detailed explanation of load balancing in the context of OpenShift Virtualization.',
  [OLSPromptType.MACHINE_TYPE]:
    'Provide a detailed explanation of the QEMU machine type in the context of OpenShift Virtualization.',
  [OLSPromptType.MAX_MIGRATIONS_PER_CLUSTER]:
    'Provide a detailed explanation of maximum migrations per Cluster in OpenShift Virtualization.',
  [OLSPromptType.MAX_MIGRATIONS_PER_NODE]:
    'Provide a detailed explanation of maximum migrations per Node in OpenShift Virtualization.',
  [OLSPromptType.MEMORY_ALLOCATION]:
    'Provide a detailed explanation of memory allocation in OpenShift Virtualization.',
  [OLSPromptType.MIGRATION_METRICS]:
    'Provide a detailed explanation of the metrics involved in the live migration of a VirtualMachine in OpenShift Virtualization.',
  [OLSPromptType.MONITORING]:
    'Provide a detailed explanation of monitoring in OpenShift Virtualization including the types of metrics collected.',
  [OLSPromptType.MTU]:
    'Provide a detailed explanation of MTUs in the context of physical networks in OpenShift Virtualization.',
  [OLSPromptType.NAME]:
    'Provide a detailed explanation of the metadata.name field in the context of OpenShift and OpenShift Virtualization.',
  [OLSPromptType.NAMESPACE]:
    'Provide a detailed explanation of namespaces in the context of OpenShift and OpenShift Virtualization.',
  [OLSPromptType.NETWORKING_BINDING_TYPES]:
    'Provide a detailed explanation of network binding types in OpenShift Virtualization.',
  [OLSPromptType.NODE_HEALTH_CHECK_OPERATOR_ALTERNATIVES]:
    'Explain options for alternative operators for the Node Health Check operator.',
  [OLSPromptType.ORGANIZATION_ID]:
    'Provide a detailed explanation of organization IDs in the context of OpenShift Virtualization.',
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
  [OLSPromptType.SNAPSHOTS]:
    'Provide a detailed explanation of snapshots in OpenShift Virtualization.',
  [OLSPromptType.SSH_OVER_LOADBALANCER_SERVICE]:
    'Provide a detailed explanation of LoadBalancer services for SSH connections in OpenShift Virtualization.',
  [OLSPromptType.SSH_OVER_NODEPORT_SERVICE]:
    'Provide a detailed explanation of NodePort services for SSH connections in OpenShift Virtualization.',
  [OLSPromptType.SSH_USING_VIRTCTL]:
    'Provide a detailed explanation with examples of connecting to a VirtualMachine via the command line using SSH through virtctl.',
  [OLSPromptType.START_IN_PAUSE_MODE]:
    'Explain what it means to start a VirtualMachine in pause mode and why a user may want to do that in the context of OpenShift Virtualization.',
  [OLSPromptType.STATUS_CONDITIONS]:
    'Provide a detailed explanation of VirtualMachine status conditions in OpenShift Virtualization.',
  [OLSPromptType.SUBSCRIPTIONS]:
    'Provide a detailed explanation of Subscriptions in the context of OpenShift Virtualization.',
  [OLSPromptType.TEMPLATE_STORAGE_CUSTOMIZATION]:
    'Explain options for customizing Template storage in OpenShift Virtualization.',
  [OLSPromptType.USE_DISK_AS_BOOT_SOURCE]:
    'Explain what it means to use a disk as a boot source in OpenShift Virtualization.',
  [OLSPromptType.VCPU_ALLOCATION]:
    'Provide a detailed explanation of vCPU allocation in OpenShift Virtualization.',
  [OLSPromptType.VIRTCTL]:
    'Provide a detailed explanation with examples of virtctl in the context of OpenShift Virtualization.',
  [OLSPromptType.VIRTUAL_MEMORY_ALLOCATION]:
    'Provide a detailed explanation of virtual memory allocation in OpenShift Virtualization.',
  [OLSPromptType.VLAN_IDS]:
    'Provide a detailed explanation of VLAN IDs in OpenShift Virtualization.',
  [OLSPromptType.VLAN_TAGGING]:
    'Provide a detailed explanation of VLAN tagging in OpenShift Virtualization.',
  [OLSPromptType.VM_NETWORK_TYPES]:
    'Provide a detailed explanation of VirtualMachine network types in OpenShift Virtualization.',
  [OLSPromptType.VM_NETWORKS]:
    'Provide a detailed explanation of networks in the context of VirtualMachines in OpenShift Virtualization.',
  [OLSPromptType.VM_RESOURCE_UTILIZATION]:
    'Provide a detailed explanation of resources utilized by VirtualMachines in OpenShift Virtualization including CPU, memory, storage, and network.',
  [OLSPromptType.VMI_LIMITS]:
    'Provide a detailed explanation of VMI limits in OpenShift Virtualization.',
  [OLSPromptType.VOLUME_MODE]:
    'Provide a detailed explanation of volume modes in the context of OpenShift Virtualization storage.',
  [OLSPromptType.VOLUME_SNAPSHOT_STATUS]:
    'Provide a detailed explanation of volume snapshot status in the context of OpenShift Virtualization storage.',
};
