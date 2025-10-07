import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypeMatcher } from '@kubevirt-utils/resources/vm';
import { hasS390xArchitecture } from '@kubevirt-utils/resources/vm/utils/architecture';

export type SearchItem = {
  description?: string;
  id: string;
  isDisabled?: boolean;
  title: string;
};

export type SearchItemGetter = (vm?: V1VirtualMachine) => SearchItem[];

export type SearchItemWithTab = {
  element: SearchItem;
  tab: string;
};

export const getDetailsTabBootIds: SearchItemGetter = () => [
  { description: t('Change boot mode'), id: 'boot-mode', title: t('Boot mode') },
  { id: 'boot-management', title: t('Boot management') },
  { description: t('Change boot order'), id: 'boot-order', title: t('Boot order') },
  { id: 'start-pause-mode', title: t('Start in pause mode') },
];

export const getDetailsTabHardwareIds: SearchItemGetter = (vm) => [
  { id: 'hardware-devices', title: t('Hardware devices') },
  {
    id: 'gpu-devices',
    isDisabled: hasS390xArchitecture(vm),
    title: t('GPU devices'),
  },
  { id: 'host-devices', title: t('Host devices') },
];

export const getDetailsTabMainIds: SearchItemGetter = (vm) => [
  { id: 'guest-system-log-access', title: t('Guest system log access') },
  { id: 'headless-mode', title: t('Headless mode') },
  { id: 'hostname', title: t('Hostname') },
  { id: 'cpu-memory', title: t('CPU | Memory') },
  {
    id: 'workload-profile',
    isDisabled: Boolean(getInstanceTypeMatcher(vm)),
    title: t('Workload profile'),
  },
  { description: 'VirtualMachine Description', id: 'description', title: t('Description') },
  { id: 'details', title: t('Details') },
];

export const getStorageTabIds: SearchItemGetter = () => [
  { id: 'disks', title: t('Disks') },
  { id: 'environment', title: t('Environment') },
];

export const getNetworkTabIds: SearchItemGetter = () => [{ id: 'network', title: t('Network') }];

export const getSchedulingTabIds: SearchItemGetter = () => [
  { id: 'scheduling', title: t('Scheduling') },
  { id: 'node-selector', title: t('Node selector') },
  { id: 'tolerations', title: t('Tolerations') },
  { id: 'affinity', title: t('Affinity') },
  { id: 'descheduler', title: t('Descheduler') },
  { id: 'dedicated-resources', title: t('Dedicated resources') },
  { id: 'eviction-strategy', title: t('Eviction strategy') },
];

export const getSSHTabIds: SearchItemGetter = () => [
  { id: 'ssh', title: t('SSH') },
  { id: 'ssh-access', title: t('SSH access') },
  { id: 'public-ssh-key', title: t('Public SSH key') },
];

export const getInitialRunTabIds: SearchItemGetter = () => [
  { id: 'sysprep', title: t('Sysprep') },
  { id: 'cloud-init', title: t('Cloud-init') },
  { id: 'initial-run', title: t('Initial run') },
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

export const getSearchItems = (vm: V1VirtualMachine): SearchItemWithTab[] =>
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
