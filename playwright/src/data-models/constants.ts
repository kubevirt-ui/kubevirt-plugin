/**
 * Test Constants
 *
 * Centralized test data for tests to avoid hard-coding values in test files.
 * This ensures consistency and makes it easier to update test data.
 */

export const EXAMPLE = 'example';

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

export const WORKLOAD_TYPES = {
  /** High performance workload */
  HIGH_PERFORMANCE: 'High performance',
} as const;

export const ACTIVATION_KEY = {
  /** Test organization ID */
  TEST_ORG_ID: 'test-org-id',
  /** Test activation key */
  TEST_ACTIVATION_KEY: 'test-activation-key',
} as const;

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

export const QUICK_START_TITLES = {
  /** Create VM from volume quick start title */
  CREATE_VM_FROM_VOLUME: 'Create a virtual machine from a volume',
} as const;

export const OC_COMMANDS = {
  /** Delete centos-stream9 image cron volumesnapshot */
  DELETE_CENTOS_STREAM9_SNAPSHOT:
    'oc delete volumesnapshot -n openshift-virtualization-os-images -l cdi.kubevirt.io/dataImportCron=centos-stream9-image-cron',
  /** Get centos-stream9 image cron volumesnapshot */
  GET_CENTOS_STREAM9_SNAPSHOT:
    'oc get volumesnapshot -n openshift-virtualization-os-images -l cdi.kubevirt.io/dataImportCron=centos-stream9-image-cron | grep centos-stream9',
} as const;

export const ALERT_MESSAGES = {
  /** Restart required message */
  RESTART_REQUIRED: 'Restart required',
  /** VM created successful message */
  VM_CREATED_SUCCESSFULLY: 'The virtual machine was created successfully.',
  /** Complete text */
  COMPLETE: 'Complete',
} as const;

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

export const HCO_SPEC_PATHS = {
  /** Guest system log access spec path */
  GUEST_SYSTEM_LOG_ACCESS: '.spec.featureGates.enableGuestSystemLogAccess',
} as const;

export const SEARCH_TERMS = {
  /** Cloud-init search term */
  CLOUD_INIT: 'cloud-init',
} as const;

export const PVC_NAMES = {
  /** Auto test PVC */
  AUTO_TEST_PVC: 'auto-test-pvc',
} as const;

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

export const TEST_METADATA = {
  /** Example template metadata name */
  EXAMPLE,
} as const;

export const TEST_LABELS = {
  /** Test label key */
  KEY: 'testlabel',
  /** Test label value */
  VALUE: 'testcnv',
  /** Test label 2 */
  LABEL2: 'testlabel2=testcnv2',
} as const;

export const TEST_ANNOTATIONS = {
  /** Test annotation key */
  KEY: 'test-annotation',
  /** Test annotation value */
  VALUE: 'cnv',
} as const;

export const CLOUD_INIT_CREDENTIALS = {
  /** Test username */
  USERNAME: 'redhat',
  /** Test password */
  PASSWORD: '123456',
} as const;

export const SERVICE_NAMES = {
  /** Headless service name */
  HEADLESS: 'headless',
} as const;

export const SSH_CONFIG = {
  /** Default SSH public key content for tests */
  PUBLIC_KEY:
    'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7ulQCA7VqD41FJC0msmnnicineMNEHJtrM1RzvpkM4DukTIVS8CmUFZx+Ksr6DB1upVa7+mOG1UdRQBDZOzzG2Ho4goSzpyn3plF3p7esfSYfpw7GD+gEyvrLxonIG1oBp/EyDcOa+GcI5KB0cnYx4TaDbu/ekVzIZXdUoUo/pw/aWBjiRmbQEeSfa8eddgIuvD0CHO2R/JQNmwhr3gyae98w8c9ljiFaPJ3PonrHetyftofimp521PE3wb6r4F+SGf+xqX5gRd8x8iTqvBh/S6vRKHdkeJfog+dhNjGmJ4lbzcFVO7yLub+6r2dNDB/eeRyCdCfDqQS7xz4r5myiYI2kKv5SntZR06J+5K6uGCb5RimiPNbGLMwNaRjK5m/dhN6rtcq7ohqlowUsnPATCuKngDaLr471w12r8ztWXw9SgvPJ6DPbVdyfky t92jk2lb9wVBLsrz5rEptKqwNWRO2Qe7x3NXQw1ax4VAh0jEeTIBGaGmE= test-key',
} as const;

export const CHECKUP_NAMES = {
  /** Network latency checkup name */
  NETWORK_LATENCY: 'kubevirt-vm-latency-checkup',
  /** Storage checkup name */
  STORAGE: 'kubevirt-storage-checkup',
  /** Self validation checkup name */
  SELF_VALIDATION: 'ocp-virt-self-validation',
} as const;

export const LABEL_KEYS = {
  /** Instance type label key */
  INSTANCE_TYPE: 'instancetype',
  /** Template label key */
  TEMPLATE: 'template',
} as const;

export const LABEL_VALUES = {
  /** True value for labels */
  TRUE: 'true',
} as const;

export const DESCRIPTION_FILTERS = {
  /** Customized description filter */
  CUSTOMIZED: 'Customized',
} as const;

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

export const COMPARISON_OPERATORS = {
  /** Less than operator */
  LESS_THAN: 'Less than',
} as const;

export const DISK_SIZES = {
  /** 1 GiB disk size */
  ONE_GIB: '1',
  /** 2 GiB disk size */
  TWO_GIB: '2',
  /** 4 GiB disk size */
  FOUR_GIB: '4',
} as const;

export const NAMESPACES = {
  /** OpenShift namespace for other project tests */
  OPENSHIFT: 'openshift',
} as const;

export const SAVED_SEARCH = {
  /** Saved search name */
  NAME: 'Saved search CNV QE',
  /** Saved search description */
  DESCRIPTION: 'CNV QE Testing save',
} as const;

export const SCHEDULING_SETTINGS = {
  /** Dedicated resources setting */
  DEDICATED_RESOURCES: 'Dedicated resources',
} as const;

export const BOOT_MODES = {
  /** BIOS boot mode */
  BIOS: 'BIOS',
  /** UEFI boot mode */
  UEFI: 'UEFI',
  /** UEFI Secure boot mode */
  UEFI_SECURE: 'UEFI Secure',
} as const;

export const SEARCH_FILTERS = {
  /** Search filter for 'auto' prefix */
  AUTO_PREFIX: 'auto',
  /** Search filter for instance type suffix */
  INSTANCE_TYPE_SUFFIX: '-it-',
} as const;

export const DISK_RESERVATION = {
  /** LUN disk reservation JSON */
  LUN_DISK_RESERVATION: '"lun":{"bus":"scsi","reservation":true}',
  /** Shareable disk JSON */
  SHAREABLE_DISK: '"disk":{"bus":"virtio"},"name":"sharedisk","shareable":true',
} as const;

export const FEATURE_GATES = {
  /** Deploy Kube Secondary DNS feature gate */
  DEPLOY_KUBE_SECONDARY_DNS: 'deployKubeSecondaryDNS',
} as const;

export const CHECKUP_TIMEOUTS = {
  /** Default checkup timeout in minutes */
  DEFAULT: '5',
} as const;

export const SECRET_NAMES = {
  /** Test secret name for SSH key management */
  TEST_SECRET: 'test-secret',
} as const;

export const MIGRATION_CONFIG = {
  /** Parallel migrations per cluster */
  PARALLEL_PER_CLUSTER: '4',
  /** Parallel outbound migrations per node */
  PARALLEL_PER_NODE: '1',
} as const;

export const MEMORY_DENSITY = {
  /** Memory overcommit percentage when enabled */
  ENABLED_PERCENTAGE: '150',
  /** Memory overcommit percentage when disabled */
  DISABLED_PERCENTAGE: '100',
} as const;

export const VERSION = {
  /** Expected version prefix */
  VERSION_PREFIX: '4',
  /** Expected version status */
  STATUS: 'Up to date',
} as const;

// Domain re-exports
export * from './template-constants';
export {
  ADMIN_ONLY_TAG,
  GATING,
  GATING_TAG,
  T1,
  T1_TAG,
  T2,
  T2_TAG,
  VM_ACTIONS_TAG,
  VM_LIST_TAG,
  VM_OVERVIEW_TAG,
  VM_TABS_TAG,
} from './test-tags';
export * from './vm-constants';
