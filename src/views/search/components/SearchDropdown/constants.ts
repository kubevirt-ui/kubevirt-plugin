import { type TFunction } from 'i18next';

import { NumberOperator, numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { SEARCH_KEY_BADGES } from './searchKeyBadges';
import { type SearchExample, type SearchKeyBadge, type ValueOption } from './types';

export const SEARCH_KEYS = {
  ARCHITECTURE: 'arch',
  CLUSTER: 'cluster',
  CPU: 'vcpu',
  DATE_CREATED: 'created',
  DESCRIPTION: 'description',
  GROUP: 'group',
  GUEST_AGENT: 'guestagent',
  HAS: 'has',
  IP: 'ip',
  LABELS: 'label',
  MEMORY: 'memory',
  NAME: 'name',
  NETWORK: 'network',
  NODE: 'node',
  OS: 'os',
  PROJECT: 'project',
  SCHEDULING: 'scheduling',
  STATUS: 'status',
  STORAGE_CLASS: 'storage',
} as const;

export { SEARCH_KEY_BADGES } from './searchKeyBadges';

export const getSearchKeyBadges = (isACMPage: boolean, foldersEnabled: boolean): SearchKeyBadge[] =>
  SEARCH_KEY_BADGES.filter((badge) => {
    if (badge.filterType === VirtualMachineRowFilterType.Group) {
      return foldersEnabled;
    }
    if (badge.filterType === VirtualMachineRowFilterType.Cluster) {
      return isACMPage;
    }
    return true;
  });

export const getSearchExamples = (t: TFunction): SearchExample[] => [
  {
    description: t('find RHEL VMs in default project with more than 4 vCPUs'),
    query: 'project:default os:RHEL vcpu>4',
  },
  {
    description: t('show Stopped or paused VMs'),
    query: 'status:Stopped,paused',
  },
  {
    description: t('any VM in project openshift that has a GPU'),
    query: 'project:openshift has:gpu',
  },
  {
    description: t('running VMs without GPU'),
    query: 'status:Running -has:gpu',
  },
  {
    description: t('Windows VMs in project default'),
    query: 'os:Windows project:default',
  },
  {
    description: t('VMs with more than 8 GiB memory'),
    query: 'memory>8GiB',
  },
  {
    description: t('VMs connected to a specific network'),
    query: 'network:default/my-network status:Running',
  },
];

export const DEFAULT_VISIBLE_EXAMPLES = 3;

export const TOOLTIP_DELAY_MS = 600;

export const OPERATOR_OPTIONS: ValueOption[] = Object.values(NumberOperator).map((operator) => ({
  label: numberOperatorInfo[operator].text,
  value: numberOperatorInfo[operator].sign,
}));
