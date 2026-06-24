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

export const VM_CUSTOMIZATION = {
  /** Test description */
  DESCRIPTION: 'description of customize it',
  /** Test hostname */
  HOSTNAME: 'test-customize-it',
  /** Edit hostname */
  EDIT_HOSTNAME: 'edit-hostname',
} as const;

export const K8S_RESOURCE_TYPES = {
  /** VirtualMachine resource type */
  VM: 'vm',
  /** VirtualMachineInstance resource type */
  VMI: 'vmi',
  /** HyperConverged resource type */
  HCO: 'hco',
} as const;

export const K8S_RESOURCE_NAMES = {
  /** HyperConverged resource name */
  KUBEVIRT_HYPERCONVERGED: 'kubevirt-hyperconverged',
} as const;

export const K8S_NAMESPACES = {
  /** OpenShift CNV namespace */
  OPENSHIFT_CNV: 'openshift-cnv',
} as const;

export const K8S_PATCH_TYPES = {
  /** Merge patch type */
  MERGE: 'merge',
} as const;

export const K8S_CONDITIONS = {
  /** Ready condition */
  READY: 'ready',
} as const;

export const OC_WAIT_TIMEOUTS = {
  /** Standard wait timeout for VM ready condition (300 seconds = 5 minutes) */
  VM_READY: 300,
} as const;
