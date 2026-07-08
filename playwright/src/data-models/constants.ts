import { EnvVariables } from '@/utils/env-variables';

/**
 * Test Constants
 *
 * Centralized test data for tests to avoid hard-coding values in test files.
 * This ensures consistency and makes it easier to update test data.
 */

const TEST_NS = EnvVariables.testNamespace;

export const EXAMPLE = 'example';

/**
 * Disk name constants
 */
export const DISK_NAMES = {
  /** LUN disk name */
  LUN_DISK: 'lundisk',
  /** Shareable disk name */
  SHAREABLE_DISK: 'sharedisk',
  /** Blank disk name */
  BLANK: 'disk-blank',
  /** EPHEMERAL disk name */
  EPHEMERAL: 'disk-ephemeral',
  /** Root disk name */
  ROOT: 'rootdisk',
  /** Boot volume name pattern */
  BOOT_VOL: (diskName: string) => `${diskName}-bootvol`,
  /** CD-ROM disk name */
  CDROM_DISK: 'cdrom-disk',
} as const;

/**
 * Storage class constants for storage migration tests
 */
export const STORAGE_CLASSES = {
  /** Hostpath CSI basic storage class */
  HOSTPATH_CSI_BASIC: 'hostpath-csi-basic',
  /** OCS storage cluster Ceph RBD virtualization storage class */
  OCS_STORAGECLUSTER_CEPH_RBD_VIRTUALIZATION: 'ocs-storagecluster-ceph-rbd-virtualization',
  /** Storage class for VM destination migration */
  VM_DESTINATION: 'hostpath-csi-pvc-block',
  /** Storage class for volume destination migration */
  VOL_DESTINATION: 'ocs-storagecluster-ceph-rbd',
  /** Default storage class for virtualization */
  DEFAULT: 'ocs-storagecluster-ceph-rbd-virtualization',
} as const;

/**
 * Workload type constants
 */
export const WORKLOAD_TYPES = {
  /** High performance workload */
  HIGH_PERFORMANCE: 'High performance',
} as const;

/**
 * Activation key test data
 */
export const ACTIVATION_KEY = {
  /** Test organization ID */
  TEST_ORG_ID: 'test-org-id',
  /** Test activation key */
  TEST_ACTIVATION_KEY: 'test-activation-key',
} as const;

/**
 * Top consumers card names
 */
export const TOP_CONSUMERS_CARDS = [
  'CPU',
  'Memory',
  'Memory swap traffic',
  'vCPU wait',
  'Storage throughput',
  'Storage IOPS',
  'Storage read latency',
  'Storage write latency',
] as const;

/**
 * Quick start titles
 */
export const QUICK_START_TITLES = {
  /** Create VM from volume quick start title */
  CREATE_VM_FROM_VOLUME: 'Create a virtual machine from a volume',
} as const;

/**
 * VM name prefixes for test VMs
 */
export const VM_NAME_PREFIXES = {
  /** SCSI disk test VM prefix */
  SCSI_DISK_TEST: 'scsi-disk-test',
  /** CentOS activation test VM prefix */
  CENTOS_ACTIVATION: 'vm-centos-activation',
  /** Migration test VM prefix */
  MIGRATION: 'vm-migration',
  /** Instance type guest log test VM prefix */
  INSTANCE_TYPE_GUEST_LOG: 'vm-instancetype-guestlog',
  /** Template guest log test VM prefix */
  TEMPLATE_GUEST_LOG: 'vm-template-guestlog',
  /** KSM test VM prefix */
  KSM_TEST: 'vm-ksm-test',
  /** Storage class migration VM prefix */
  SC_MIGRATION_VM: 'vm-sc-migration-vm',
  /** Storage class migration volume prefix */
  SC_MIGRATION_VOL: 'vm-sc-migration-vol',
  /** VM disks test prefix */
  VM_DISKS: 'vm-disks',
  /** VM VGPU prefix */
  VM_VGPU: 'vm-vgpu',
  /** VM source prefix for cloning tests */
  VM_SOURCE: 'vm-source',
  /** VM cloned prefix for cloning tests */
  VM_CLONED: 'vm-cloned',
  /** VM from edited boot source reference prefix */
  VM_FROM_EDITED_BSR: 'vm-from-edited-bsr',
  /** VM from clone template prefix */
  VM_FROM_CLONE_TEMPLATE: 'vm-from-clone-template',
  /** VM used as source for save-as-template tests */
  VM_SAVE_AS_TEMPLATE: 'vm-save-tpl',
} as const;

/**
 * Instance type configurations
 */
export const IT_PREFS = {
  /** CentOS Stream 9 */
  CENTOS_STREAM9: 'centos.stream9',
} as const;

/**
 * Instance type configurations
 */
export const INSTANCE_TYPES = {
  /** CentOS Stream 9 */
  CENTOS_STREAM9: 'centos-stream9',
  /** CentOS Stream 10 */
  CENTOS_STREAM10: 'centos-stream10',
  /** RHEL9 OS */
  RHEL9: 'rhel9',
  /** RHEL10 OS */
  RHEL10: 'rhel10',
  /** Fedora OS */
  FEDORA: 'fedora',
  /** U series */
  U_SERIES: 'U',
  /** C series */
  CX_SERIES: 'CX',
  /** Small size */
  SMALL: 'small',
  /** Small size */
  U_SMALL: 'small: 1 CPUs, 2 GiB Memory',
  /** Medium size */
  MEDIUM: 'medium',
  /** Medium size for U series */
  U_MEDIUM: 'medium: 1 CPUs, 4 GiB Memory',
  /** Medium size for CX series with Hugepages */
  CX_MEDIUM: 'medium: 1 CPUs, 2 GiB Memory',
  /** Medium size for CX series with Hugepages */
  CX_HP_MEDIUM: 'medium1gi: 1 CPUs, 2 GiB Memory',
  /** Large size */
  LARGE: 'large',
  /** Example instance type name */
  EXAMPLE: EXAMPLE,
  /** cx1.medium instance type */
  CX1_MEDIUM: 'cx1.medium',
  /** cx1.2xlarge instance type */
  CX1_2XLARGE: 'cx1.2xlarge',
} as const;

/**
 * Disk reservation configuration
 */
export const DISK_RESERVATION = {
  /** LUN disk reservation JSON */
  LUN_DISK_RESERVATION: '"lun":{"bus":"scsi","reservation":true}',
  /** Shareable disk JSON */
  SHAREABLE_DISK: '"disk":{"bus":"virtio"},"name":"sharedisk","shareable":true',
} as const;

/**
 * OC CLI commands
 */
export const OC_COMMANDS = {
  /** Delete centos-stream9 image cron volumesnapshot */
  DELETE_CENTOS_STREAM9_SNAPSHOT:
    'oc delete volumesnapshot -n openshift-virtualization-os-images -l cdi.kubevirt.io/dataImportCron=centos-stream9-image-cron',
  /** Get centos-stream9 image cron volumesnapshot */
  GET_CENTOS_STREAM9_SNAPSHOT:
    'oc get volumesnapshot -n openshift-virtualization-os-images -l cdi.kubevirt.io/dataImportCron=centos-stream9-image-cron | grep centos-stream9',
} as const;

/**
 * Alert messages
 */
export const ALERT_MESSAGES = {
  /** Restart required message */
  RESTART_REQUIRED: 'Restart required',
  /** VM created successful message */
  VM_CREATED_SUCCESSFULLY: 'The virtual machine was created successfully.',
  /** Complete text */
  COMPLETE: 'Complete',
} as const;

/**
 * Feature names
 */
export const FEATURES = {
  /** Network observability */
  NETWORK_OBSERVABILITY: 'Network observability',
  /** Host network management (NMState) */
  HOST_NETWORK_MANAGEMENT: 'Host network management (NMState)',
  /** High availability */
  HIGH_AVAILABILITY: 'High availability',
  /** Node health check (NHC) */
  NODE_HEALTH_CHECK: 'Node health check (NHC)',
  /** Fence agents remediation (FAR) */
  FENCE_AGENTS_REMEDIATION: 'Fence agents remediation (FAR)',
} as const;

/**
 * Checkbox IDs
 */
export const CHECKBOX_IDS = {
  /** Persistent reservation checkbox */
  PERSISTENT_RESERVATION: 'persistent-reservation-section',
  /** Kernel same-page merging checkbox */
  KERNEL_SAMEPAGE_MERGING: 'kernel-samepage-merging',
  /** Guest system log access checkbox */
  GUEST_SYSTEM_LOG_ACCESS: 'guest-system-log-access',
  /** Auto-update RHEL VMs checkbox */
  AUTO_UPDATE_RHEL_VMS: 'auto-update-rhel-vms',
} as const;

/**
 * HCO spec paths
 */
export const HCO_SPEC_PATHS = {
  /** Guest system log access spec path */
  GUEST_SYSTEM_LOG_ACCESS: '.spec.featureGates.enableGuestSystemLogAccess',
} as const;

/**
 * Search terms
 */
export const SEARCH_TERMS = {
  /** Cloud-init search term */
  CLOUD_INIT: 'cloud-init',
} as const;

/**
 * PVC names used in tests
 */
export const PVC_NAMES = {
  /** Auto test PVC */
  AUTO_TEST_PVC: 'auto-test-pvc',
} as const;

/**
 * Registry URLs used in tests
 */
export const REGISTRY_URLS = {
  /** Fedora 40 container disk */
  FEDORA_40: 'quay.io/openshift-cnv/qe-cnv-tests-fedora:40',
  /** Fedora latest container disk */
  FEDORA_LATEST: 'quay.io/containerdisks/fedora:latest',
  /** CentOS Stream 9 container disk */
  CENTOS_STREAM_9: 'quay.io/containerdisks/centos-stream:9',
  /** Docker example image */
  DOCKER_EXAMPLE: 'docker.io/upalatucci/example',
} as const;

/**
 * Registry credentials for authenticated registries
 */
export const REGISTRY_CREDENTIALS = {
  /** Quay.io read-only user */
  QUAY_USER: process.env.REGISTRY_QUAY_USER || '',
  /** Quay.io read-only user password */
  QUAY_PASSWORD: process.env.REGISTRY_QUAY_PASSWORD || '',
  /** Docker user */
  DOCKER_USER: process.env.REGISTRY_DOCKER_USER || '',
  /** Docker password */
  DOCKER_PASSWORD: process.env.REGISTRY_DOCKER_PASSWORD || '',
  /** Quay.io upload URL */
  QUAY_UL_URL: process.env.REGISTRY_QUAY_UL_URL || '',
  /** Quay.io upload username */
  QUAY_UL_USER: process.env.REGISTRY_QUAY_UL_USER || '',
  /** Quay.io upload password */
  QUAY_UL_PASSWD: process.env.REGISTRY_QUAY_UL_PASSWD || '',
} as const;

/**
 * Test metadata values
 */
export const TEST_METADATA = {
  /** Example template metadata name */
  EXAMPLE: EXAMPLE,
} as const;

/**
 * Test label and annotation values
 */
export const TEST_LABELS = {
  NAME: 'e2e-label',
  VALUE: 'e2e-cnv',
  LABEL2: 'e2e-label2=e2e-cnv2',
} as const;

/**
 * Test annotation values
 */
export const TEST_ANNOTATIONS = {
  NAME: 'e2e-annotation',
  VALUE: 'cnv',
} as const;

/**
 * Test cloud-init credentials
 */
export const CLOUD_INIT_CREDENTIALS = {
  /** Test username */
  USERNAME: 'redhat',
  /** Test password */
  PASSWORD: '123456',
} as const;

/**
 * Test VM customization values
 */
export const VM_CUSTOMIZATION = {
  /** Test description */
  DESCRIPTION: 'description of customize it',
  /** Test hostname */
  HOSTNAME: 'test-customize-it',
  /** Edit hostname */
  EDIT_HOSTNAME: 'edit-hostname',
} as const;

/**
 * Service names
 */
export const SERVICE_NAMES = {
  /** Headless service name */
  HEADLESS: 'headless',
} as const;

/**
 * SSH configuration for tests
 */
export const SSH_CONFIG = {
  /** Default SSH public key content for tests */
  PUBLIC_KEY:
    'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7ulQCA7VqD41FJC0msmnnicineMNEHJtrM1RzvpkM4DukTIVS8CmUFZx+Ksr6DB1upVa7+mOG1UdRQBDZOzzG2Ho4goSzpyn3plF3p7esfSYfpw7GD+gEyvrLxonIG1oBp/EyDcOa+GcI5KB0cnYx4TaDbu/ekVzIZXdUoUo/pw/aWBjiRmbQEeSfa8eddgIuvD0CHO2R/JQNmwhr3gyae98w8c9ljiFaPJ3PonrHetyftofimp521PE3wb6r4F+SGf+xqX5gRd8x8iTqvBh/S6vRKHdkeJfog+dhNjGmJ4lbzcFVO7yLub+6r2dNDB/eeRyCdCfDqQS7xz4r5myiYI2kKv5SntZR06J+5K6uGCb5RimiPNbGLMwNaRjK5m/dhN6rtcq7ohqlowUsnPATCuKngDaLr471w12r8ztWXw9SgvPJ6DPbVdyfky t92jk2lb9wVBLsrz5rEptKqwNWRO2Qe7x3NXQw1ax4VAh0jEeTIBGaGmE= test-key',
} as const;

/**
 * Checkup name constants
 */
export const CHECKUP_NAMES = {
  /** Network latency checkup name */
  NETWORK_LATENCY: 'kubevirt-vm-latency-checkup',
  /** Storage checkup name */
  STORAGE: 'kubevirt-storage-checkup',
  /** Self validation checkup name */
  SELF_VALIDATION: 'ocp-virt-self-validation',
} as const;

/**
 * Label key constants for advanced search
 */
export const LABEL_KEYS = {
  /** Instance type label key */
  INSTANCE_TYPE: 'instancetype',
  /** Template label key */
  TEMPLATE: 'template',
} as const;

/**
 * Label value constants
 */
export const LABEL_VALUES = {
  /** True value for labels */
  TRUE: 'true',
} as const;

/**
 * Description filter constants
 */
export const DESCRIPTION_FILTERS = {
  /** Customized description filter */
  CUSTOMIZED: 'Customized',
} as const;

/**
 * Search filter value constants
 */
export const SEARCH_VALUES = {
  /** vCPU value 0 */
  VCPU_ZERO: '0',
  /** vCPU value 1 */
  VCPU_ONE: '1',
  /** Memory value 2 */
  MEMORY_TWO: '2',
  /** Memory value 4 */
  MEMORY_FOUR: '4',
} as const;

/**
 * Comparison operator constants
 */
export const COMPARISON_OPERATORS = {
  /** Less than operator */
  LESS_THAN: 'Less than',
} as const;

/**
 * Operating system name constants
 */
export const OS_NAMES = {
  /** Red Hat Enterprise Linux */
  RHEL: 'Red Hat Enterprise Linux',
} as const;

/**
 * Disk size constants (in GiB)
 */
export const DISK_SIZES = {
  /** 1 GiB disk size */
  ONE_GIB: '1',
  /** 2 GiB disk size */
  TWO_GIB: '2',
  /** 4 GiB disk size */
  FOUR_GIB: '4',
} as const;

/**
 * Namespace constants
 */
export const NAMESPACES = {
  /** OpenShift namespace for other project tests */
  OPENSHIFT: 'openshift',
} as const;

/**
 * Saved search constants
 */
export const SAVED_SEARCH = {
  /** Saved search name */
  NAME: 'Saved search CNV QE',
  /** Saved search description */
  DESCRIPTION: 'CNV QE Testing save',
} as const;

/**
 * Template name prefixes for test generation
 */
export const TEMPLATE_NAME_PREFIXES = {
  /** Test clone template prefix */
  TEST_CLONE_TEMPLATE: 'test-clone-template',
} as const;

/**
 * Scheduling setting constants
 */
export const SCHEDULING_SETTINGS = {
  /** Dedicated resources setting */
  DEDICATED_RESOURCES: 'Dedicated resources',
} as const;

/**
 * Boot mode constants
 */
export const BOOT_MODES = {
  /** BIOS boot mode */
  BIOS: 'BIOS',
  /** UEFI boot mode */
  UEFI: 'UEFI',
  /** UEFI Secure boot mode */
  UEFI_SECURE: 'UEFI Secure',
} as const;

/**
 * Search filter constants
 */
export const SEARCH_FILTERS = {
  /** Search filter for 'auto' prefix */
  AUTO_PREFIX: 'auto',
  /** Search filter for instance type suffix */
  INSTANCE_TYPE_SUFFIX: '-it-',
} as const;

/**
 * VM status constants
 */
export const VM_STATUS = {
  /** VM is running */
  RUNNING: 'Running',
  /** VM is starting */
  STARTING: 'Starting',
  /** VM is stopped */
  STOPPED: 'Stopped',
  /** VM is stopping */
  STOPPING: 'Stopping',
  /** VM is ready */
  READY: 'Ready',
  /** VM is pending */
  PENDING: 'Pending',
  /** VM is paused */
  PAUSED: 'Paused',
  /** VM is migrating */
  MIGRATING: 'Migrating',
  /** VM has DataVolume error */
  DATA_VOLUME_ERROR: 'DataVolumeError',
  /** VM is provisioning */
  PROVISIONING: 'Provisioning',
} as const;

/**
 * VM action label constants (as displayed in the UI action menus)
 */
export const VM_ACTION = {
  Cancel: 'Cancel Virtual Machine Migration',
  Clone: 'Clone',
  Delete: 'Delete',
  Migrate: 'Migrate',
  Restart: 'Restart',
  Start: 'Start',
  Stop: 'Stop',
  Pause: 'Pause',
  Unpause: 'Unpause',
} as const;

/**
 * Kubernetes resource type constants
 */
export const K8S_RESOURCE_TYPES = {
  /** VirtualMachine resource type */
  VM: 'vm',
  /** VirtualMachineInstance resource type */
  VMI: 'vmi',
  /** HyperConverged resource type */
  HCO: 'hco',
} as const;

/**
 * Kubernetes resource name constants
 */
export const K8S_RESOURCE_NAMES = {
  /** HyperConverged resource name */
  KUBEVIRT_HYPERCONVERGED: 'kubevirt-hyperconverged',
} as const;

/**
 * Kubernetes namespace constants
 */
export const K8S_NAMESPACES = {
  /** OpenShift CNV namespace */
  OPENSHIFT_CNV: 'openshift-cnv',
} as const;

/**
 * Kubernetes patch type constants
 */
export const K8S_PATCH_TYPES = {
  /** Merge patch type */
  MERGE: 'merge',
} as const;

/**
 * Kubernetes condition constants
 */
export const K8S_CONDITIONS = {
  /** Ready condition */
  READY: 'ready',
} as const;

/**
 * Feature gate constants
 */
export const FEATURE_GATES = {
  /** Deploy Kube Secondary DNS feature gate */
  DEPLOY_KUBE_SECONDARY_DNS: 'deployKubeSecondaryDNS',
} as const;

/**
 * OC CLI wait timeout constants (in seconds)
 */
export const OC_WAIT_TIMEOUTS = {
  /** Standard wait timeout for VM ready condition (300 seconds = 5 minutes) */
  VM_READY: 300,
} as const;

/**
 * Checkup timeout constants
 */
export const CHECKUP_TIMEOUTS = {
  /** Default checkup timeout in minutes */
  DEFAULT: '5',
} as const;

/**
 * Networking test constants
 */
export const TEST_PHYS_NNCP_NAME = 'physical-network-nncp';
export const TEST_PHYS_NET_NAME = 'auto-test-phys-localnet';

export const NETWORKING = {
  /** Test physical network name (created before VMN tests) */
  TEST_PHYS_NET_NAME,
  /** Virtual machine network — project-mapped */
  VM_NET_PROJECT: {
    name: 'auto-test-vm-network-project',
    description: 'Test project-mapped Virtual machine network for QE',
    nodeNetMapping: TEST_PHYS_NET_NAME,
    project: TEST_NS,
  },
  /** Virtual machine network — label-mapped */
  VM_NET_LABELED: {
    name: 'auto-test-vm-network-labeled',
    description: 'Test label-mapped Virtual machine network for QE',
    nodeNetMapping: TEST_PHYS_NET_NAME,
    label: 'k8s.ovn.org/primary-user-defined-network',
    project: 'udn-test-ns',
  },
} as const;

/**
 * Gating test constants
 *
 * Centralized test data for gating tests to avoid hard-coding values in test files.
 * This ensures consistency and makes it easier to update test data.
 */

/**
 * Secret names used in gating tests
 */
export const SECRET_NAMES = {
  /** Test secret name for SSH key management */
  TEST_SECRET: 'test-secret',
} as const;

/**
 * Template display names
 */
export const TEMPLATE_DISPLAY_NAMES = {
  /** Test clone template display name */
  TEST_CLONE_TEMPLATE: 'Test Clone Template',
  /** RHEL 8 template display name */
  RHEL8: 'Red Hat Enterprise Linux 8 VM',
  /** RHEL 9 template display name */
  RHEL9: 'Red Hat Enterprise Linux 9 VM',
  /** Fedora template display name */
  FEDORA: 'Fedora VM',
  /** CentOS Stream 9 template display name */
  CENTOS_STREAM_9: 'CentOS Stream 9 VM',
  /** Windows 11 template display name */
  WIN11: 'Microsoft Windows 11 VM',
  /** Windows Server 2022 template display name */
  WIN2K22: 'Microsoft Windows Server 2022 VM',
  /** Windows Server 2016 template display name */
  WIN2K16: 'Microsoft Windows Server 2016 VM',
  /** Windows Server 2019 template display name */
  WIN2K19: 'Microsoft Windows Server 2019 VM',
} as const;

/**
 * OS filter names used in gating tests
 */
export const OS_FILTERS = {
  /** RHEL OS filter */
  RHEL: 'rhel',
  /** Windows OS filter */
  WINDOWS: 'windows',
  /** Fedora OS filter */
  FEDORA: 'Fedora',
} as const;

/**
 * Workload filter names used in gating tests
 */
export const WORKLOAD_FILTERS = {
  /** Server workload filter */
  SERVER: 'Server',
  /** Desktop workload filter */
  DESKTOP: 'Desktop',
} as const;

/**
 * Provider filter names used in gating tests
 */
export const PROVIDER_FILTERS = {
  /** Other provider filter */
  OTHER: 'Other',
} as const;

/**
 * Live migration configuration values
 */
export const MIGRATION_CONFIG = {
  /** Parallel migrations per cluster */
  PARALLEL_PER_CLUSTER: '4',
  /** Parallel outbound migrations per node */
  PARALLEL_PER_NODE: '1',
} as const;

/**
 * Memory density configuration values
 */
export const MEMORY_DENSITY = {
  /** Memory overcommit percentage when enabled */
  ENABLED_PERCENTAGE: '150',
  /** Memory overcommit percentage when disabled */
  DISABLED_PERCENTAGE: '100',
} as const;

/**
 * Version verification values
 */
export const VERSION = {
  /** Expected version prefix */
  VERSION_PREFIX: '4',
  /** Expected version status */
  STATUS: 'Up to date',
} as const;

/**
 * SSH key file paths
 */
export const SSH_KEY_PATHS = {
  /** Public SSH key file path */
  PUBLIC_KEY: './fixtures/rsa.pub',
} as const;
