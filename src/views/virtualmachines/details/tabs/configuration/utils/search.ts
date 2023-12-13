import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export type SearchItem = {
  description: string;
  id: string;
  title: string;
};
export const DETAILS_TAB_BOOT_IDS: SearchItem[] = [
  { description: t('Change boot mode'), id: 'boot-mode', title: t('Boot mode') },
  { description: '', id: 'boot-management', title: t('Boot management') },
  { description: t('Change boot order'), id: 'boot-order', title: t('Boot order') },
  { description: '', id: 'start-pause-mode', title: t('Start in pause mode') },
];

export const DETAILS_TAB_HARDWARE_IDS: SearchItem[] = [
  { description: '', id: 'hardware-devices', title: t('Hardware devices') },
  { description: '', id: 'gpu-devices', title: t('GPU devices') },
  { description: '', id: 'host-devices', title: t('Host devices') },
];

export const DETAILS_TAB_MAIN_IDS: SearchItem[] = [
  { description: '', id: 'guest-system-log-access', title: t('Guest system log access') },
  { description: '', id: 'headless-mode', title: t('Headless mode') },
  { description: '', id: 'hostname', title: t('Hostname') },
  { description: '', id: 'cpu-memory', title: t('CPU | Memory') },
  { description: '', id: 'workload-profile', title: t('Workload profile') },
  { description: 'VirtualMachine Description', id: 'description', title: t('Description') },
  { description: '', id: 'details', title: t('Details') },
];

export const STORAGE_TAB_IDS: SearchItem[] = [
  { description: '', id: 'disks', title: t('Disks') },
  { description: '', id: 'environment', title: t('Environment') },
];

export const NETWORK_TAB_IDS: SearchItem[] = [
  { description: '', id: 'network', title: t('Network') },
];

export const SCHEDULING_TAB_IDS: SearchItem[] = [
  { description: '', id: 'scheduling', title: t('Scheduling') },
  { description: '', id: 'node-selector', title: t('Node selector') },
  { description: '', id: 'tolerations', title: t('Tolerations') },
  { description: '', id: 'affinity', title: t('Affinity') },
  { description: '', id: 'descheduler', title: t('Descheduler') },
  { description: '', id: 'dedicated-resources', title: t('Dedicated resources') },
  { description: '', id: 'eviction-strategy', title: t('Eviction strategy') },
];

export const SSH_TAB_IDS: SearchItem[] = [
  { description: '', id: 'ssh', title: t('SSH') },
  { description: '', id: 'ssh-access', title: t('SSH access') },
  { description: '', id: 'authorized-ssh-key', title: t('Authorized SSH key') },
];

export const INITIAL_RUN_TAB_IDS: SearchItem[] = [
  { description: '', id: 'sysprep', title: t('Sysprep') },
  { description: '', id: 'cloud-init', title: t('Cloud-init') },
  { description: '', id: 'initial-run', title: t('Initial run') },
];

const TABS_IDS: { [key: string]: SearchItem[] } = {
  details: [...DETAILS_TAB_BOOT_IDS, ...DETAILS_TAB_HARDWARE_IDS, ...DETAILS_TAB_MAIN_IDS],
  initial: INITIAL_RUN_TAB_IDS,
  network: NETWORK_TAB_IDS,
  scheduling: SCHEDULING_TAB_IDS,
  ssh: SSH_TAB_IDS,
  storage: STORAGE_TAB_IDS,
};

export const searchItems = Object.entries(TABS_IDS)
  .map(([tab, value]) => value.map((element) => ({ element, tab })))
  .flat()
  .sort((a, b) => a.element.title.localeCompare(b.element.title));

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
