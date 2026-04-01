import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { isErrorPrintableStatus } from '@virtualmachines/utils';

export enum OLSPromptType {
  AAQ_QUOTA_CALCULATION_METHOD = 'AAQ_QUOTA_CALCULATION_METHOD',
  ACCESS_MODE = 'ACCESS_MODE',
  ACTIVATION_KEY = 'ACTIVATION_KEY',
  ADVANCED_CDROM_FEATURES = 'ADVANCED_CDROM_FEATURES',
  ANNOTATIONS = 'ANNOTATIONS',
  APPLICATION_AWARE_QUOTA = 'APPLICATION_AWARE_QUOTA',
  AUTO_IMAGE_DOWNLOADS = 'AUTO_IMAGE_DOWNLOADS',
  BOOT_FROM_CD = 'BOOT_FROM_CD',
  BOOT_VOLUME_FOR_INSTANCETYPE_VM = 'BOOT_VOLUME_FOR_INSTANCETYPE_VM',
  BOOTABLE_VOLUME_ARCHITECTURES = 'BOOTABLE_VOLUME_ARCHITECTURES',
  BOOTABLE_VOLUME_METADATA = 'BOOTABLE_VOLUME_METADATA',
  CLONE_VOLUME = 'CLONE_VOLUME',
  CLOUDINIT_IP_ADDRESSES = 'CLOUDINIT_IP_ADDRESSES',
  CONFIGURATION_FEATURE = 'CONFIGURATION_FEATURE',
  CONFIRM_VM_ACTIONS = 'CONFIRM_VM_ACTIONS',
  CPU_ALLOCATION = 'CPU_ALLOCATION',
  CPU_MEMORY = 'CPU_MEMORY',
  DATAVOLUME_STATUS = 'DATAVOLUME_STATUS',
  DEFAULT_INSTANCETYPE = 'DEFAULT_INSTANCETYPE',
  DEFAULT_NETWORK = 'DEFAULT_NETWORK',
  DEFAULT_TEMPLATES = 'DEFAULT_TEMPLATES',
  DELETION_PROTECTION = 'DELETION_PROTECTION',
  DESCHEDULER = 'DESCHEDULER',
  DESCHEDULER_THRESHOLDS = 'DESCHEDULER_THRESHOLDS',
  DESCRIPTION = 'DESCRIPTION',
  DISK_SOURCE = 'DISK_SOURCE',
  DYNAMIC_SSH_KEY_INJECTION = 'DYNAMIC_SSH_KEY_INJECTION',
  ENABLE_GUEST_SYSTEM_LOG_ACCESS = 'ENABLE_GUEST_SYSTEM_LOG_ACCESS',
  ENABLE_MEMORY_DENSITY = 'ENABLE_MEMORY_DENSITY',
  ENABLE_PASST_BINDING = 'ENABLE_PASST_BINDING',
  ENABLE_PERSISTENT_RESERVATION = 'ENABLE_PERSISTENT_RESERVATION',
  ENABLE_PREALLOCATION = 'ENABLE_PREALLOCATION',
  ENVIRONMENT_VARS = 'ENVIRONMENT_VARS',
  FENCE_AGENTS_REMEDIATION_OPERATOR_ALTERNATIVES = 'FENCE_AGENTS_REMEDIATION_OPERATOR_ALTERNATIVES',
  FILE_SYSTEMS = 'FILE_SYSTEMS',
  GUEST_LOGIN_CREDENTIALS = 'GUEST_LOGIN_CREDENTIALS',
  GUEST_SYSTEM_LOG_ACCESS = 'GUEST_SYSTEM_LOG_ACCESS',
  GUIDED_TOUR = 'GUIDED_TOUR',
  HEADLESS_MODE = 'HEADLESS_MODE',
  HIDE_GUEST_CREDENTIALS_FOR_NON_PRIV_USERS = 'HIDE_GUEST_CREDENTIALS_FOR_NON_PRIV_USERS',
  HIDE_YAML_TAB = 'HIDE_YAML_TAB',
  HIGH_AVAILABILITY_FEATURE = 'HIGH_AVAILABILITY_FEATURE',
  HUGEPAGES = 'HUGEPAGES',
  KERNEL_SAMEPAGE_MERGING = 'KERNEL_SAMEPAGE_MERGING',
  KUBE_DESCHEDULER_OPERATOR_ALTERNATIVES = 'KUBE_DESCHEDULER_OPERATOR_ALTERNATIVES',
  LABELS = 'LABELS',
  LIVE_MIGRATION = 'LIVE_MIGRATION',
  LIVE_MIGRATION_DATA_TRANSFER_RATE = 'LIVE_MIGRATION_DATA_TRANSFER_RATE',
  LOAD_BALANCE = 'LOAD_BALANCE',
  MACHINE_TYPE = 'MACHINE_TYPE',
  MAX_MIGRATIONS_PER_CLUSTER = 'MAX_MIGRATIONS_PER_CLUSTER',
  MAX_MIGRATIONS_PER_NODE = 'MAX_MIGRATIONS_PER_NODE',
  MEMORY_ALLOCATION = 'MEMORY_ALLOCATION',
  MIGRATION_METRICS = 'MIGRATION_METRICS',
  MONITORING = 'MONITORING',
  MTU = 'MTU',
  NAME = 'NAME',
  NAMESPACE = 'NAMESPACE',
  NETWORKING_BINDING_TYPES = 'NETWORK_BINDING_TYPES',
  NODE_HEALTH_CHECK_OPERATOR_ALTERNATIVES = 'NODE_HEALTH_CHECK_OPERATOR_ALTERNATIVES',
  ORGANIZATION_ID = 'ORGANIZATION_ID',
  OWNER = 'OWNER',
  PREFERENCE = 'PREFERENCE',
  PREVIEW_FEATURES = 'PREVIEW_FEATURES',
  SET_SCSI_RESERVATION_FOR_DISK = 'SET_SCSI_RESERVATION_FOR_DISK',
  SHARE_THIS_DISK_BETWEEN_MULTI_VMS = 'SHARE_THIS_DISK_BETWEEN_MULTI_VMS',
  SNAPSHOTS = 'SNAPSHOTS',
  SSH_OVER_LOADBALANCER_SERVICE = 'SSH_OVER_LOADBALANCER_SERVICE',
  SSH_OVER_NODEPORT_SERVICE = 'SSH_OVER_NODEPORT_SERVICE',
  SSH_USING_VIRTCTL = 'SSH_USING_VIRTCTL',
  START_IN_PAUSE_MODE = 'START_IN_PAUSE_MODE',
  STATUS_CONDITIONS = 'STATUS_CONDITIONS',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  TEMPLATE_STORAGE_CUSTOMIZATION = 'TEMPLATE_STORAGE_CUSTOMIZATION',
  USE_DISK_AS_BOOT_SOURCE = 'USE_DISK_AS_BOOT_SOURCE',
  VCPU_ALLOCATION = 'VCPU_ALLOCATION',
  VIRTCTL = 'VIRTCTL',
  VIRTUAL_MEMORY_ALLOCATION = 'VIRTUAL_MEMORY_ALLOCATION',
  VLAN_IDS = 'VLAN_IDS',
  VLAN_TAGGING = 'VLAN_TAGGING',
  VM_NETWORK_TYPES = 'VM_NETWORK_TYPES',
  VM_NETWORKS = 'VM_NETWORKS',
  VM_RESOURCE_UTILIZATION = 'VM_RESOURCE_UTILIZATION',
  VM_STATUS = 'VM_STATUS',
  VM_STATUS_CONCISE = 'VM_STATUS_CONCISE',
  VMI_LIMITS = 'VMI_LIMITS',
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
    [OLSPromptType.VM_STATUS]: `Provide a detailed explanation for why a VirtualMachine would have a status of ${vmPrintableStatus}${
      isErrorStatus ? 'and provide troubleshooting steps for how to fix it' : ''
    }.`,
    [OLSPromptType.VM_STATUS_CONCISE]: `Provide a very concise explanation for why a VirtualMachine would have a status of ${vmPrintableStatus}. Don't provide troubleshooting steps and don't add phrases indicating that this response is intended to brief. Attempt to limit the response to no more than two sentences`,
    [OLSPromptType.VMI_LIMITS]:
      'Provide a detailed explanation of VMI limits in OpenShift Virtualization.',
    [OLSPromptType.VOLUME_MODE]:
      'Provide a detailed explanation of volume modes in the context of OpenShift Virtualization storage.',
    [OLSPromptType.VOLUME_SNAPSHOT_STATUS]:
      'Provide a detailed explanation of volume snapshot status in the context of OpenShift Virtualization storage.',
  };

  return olsPrompts[promptType];
};
