import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypeMatcher } from '@kubevirt-utils/resources/vm';

export type SearchItem = {
  description: string;
  id: string;
  isDisabled?: boolean;
  title: string;
};

export type SearchItemGetter = (vm?: V1VirtualMachine) => SearchItem[];

export const getDetailsTabBootIds: SearchItemGetter = () => [
  { description: t('Change boot mode'), id: 'boot-mode', title: t('Boot mode') },
  { description: '', id: 'boot-management', title: t('Boot management') },
  { description: t('Change boot order'), id: 'boot-order', title: t('Boot order') },
  { description: '', id: 'start-pause-mode', title: t('Start in pause mode') },
];

export const getDetailsTabHardwareIds: SearchItemGetter = () => [
  { description: '', id: 'hardware-devices', title: t('Hardware devices') },
  { description: '', id: 'gpu-devices', title: t('GPU devices') },
  { description: '', id: 'host-devices', title: t('Host devices') },
];

export const getDetailsTabMainIds: SearchItemGetter = (vm) => [
  { description: '', id: 'guest-system-log-access', title: t('Guest system log access') },
  { description: '', id: 'headless-mode', title: t('Headless mode') },
  { description: '', id: 'hostname', title: t('Hostname') },
  { description: '', id: 'cpu-memory', title: t('CPU | Memory') },
  {
    description: '',
    id: 'workload-profile',
    isDisabled: Boolean(getInstanceTypeMatcher(vm)),
    title: t('Workload profile'),
  },
  { description: 'VirtualMachine Description', id: 'description', title: t('Description') },
  { description: '', id: 'details', title: t('Details') },
];

export const getStorageTabIds: SearchItemGetter = () => [
  { description: '', id: 'disks', title: t('Disks') },
  { description: '', id: 'environment', title: t('Environment') },
];

export const getNetworkTabIds: SearchItemGetter = () => [
  { description: '', id: 'network', title: t('Network') },
];

export const getSchedulingTabIds: SearchItemGetter = () => [
  { description: '', id: 'scheduling', title: t('Scheduling') },
  { description: '', id: 'node-selector', title: t('Node selector') },
  { description: '', id: 'tolerations', title: t('Tolerations') },
  { description: '', id: 'affinity', title: t('Affinity') },
  { description: '', id: 'descheduler', title: t('Descheduler') },
  { description: '', id: 'dedicated-resources', title: t('Dedicated resources') },
  { description: '', id: 'eviction-strategy', title: t('Eviction strategy') },
];

export const getSSHTabIds: SearchItemGetter = () => [
  { description: '', id: 'ssh', title: t('SSH') },
  { description: '', id: 'ssh-access', title: t('SSH access') },
  { description: '', id: 'public-ssh-key', title: t('Public SSH key') },
];

export const getInitialRunTabIds: SearchItemGetter = () => [
  { description: '', id: 'sysprep', title: t('Sysprep') },
  { description: '', id: 'cloud-init', title: t('Cloud-init') },
  { description: '', id: 'initial-run', title: t('Initial run') },
];

const getTabsIds = (vm: V1VirtualMachine): { [key: string]: SearchItem[] } => ({
  details: [
    ...getDetailsTabBootIds(vm),
    ...getDetailsTabHardwareIds(vm),
    ...getDetailsTabMainIds(vm),
  ],
  initial: getInitialRunTabIds(vm),
  network: getNetworkTabIds(vm),
  scheduling: getSchedulingTabIds(vm),
  ssh: getSSHTabIds(vm),
  storage: getStorageTabIds(vm),
});

export const getSearchItems = (vm: V1VirtualMachine) =>
  Object.entries(getTabsIds(vm))
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
