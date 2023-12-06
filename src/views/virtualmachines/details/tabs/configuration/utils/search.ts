export const DETAILS_TAB_BOOT_IDS = [
  'boot-mode',
  'boot-management',
  'boot-order',
  'start-pause-mode',
];

export const DETAILS_TAB_HARDWARE_IDS = ['hardware-devices', 'gpu-devices', 'host-devices'];

export const DETAILS_TAB_MAIN_IDS = [
  'guest-system-log-access',
  'headless-mode',
  'hostname',
  'cpu-memory',
  'workload-profile',
  'description',
  'details',
];

export const STORAGE_TAB_IDS = ['disks', 'environment'];

export const NEWTWORK_TAB_IDS = ['network'];

export const SCHEDULING_TAB_IDS = [
  'scheduling',
  'node-selector',
  'tolerations',
  'affinity',
  'descheduler',
  'dedicated-resources',
  'eviction-strategy',
];

export const SSH_TAB_IDS = ['ssh', 'ssh-access', 'authorized-ssh-key'];

export const INITIAL_RUN_TAB_IDS = ['sysprep', 'cloud-init', 'initial-run'];

export const expandURLHash = (
  ids: string[],
  hash: string,
  callBack: (val: boolean) => void,
): void => {
  for (const val of ids) {
    if (hash.toLowerCase().endsWith(val.toLowerCase())) {
      return callBack(true);
    }
  }
};
