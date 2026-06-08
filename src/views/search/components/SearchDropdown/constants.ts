import { TFunction } from 'i18next';

import { NumberOperator, numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { SearchExample, SearchKeyBadge, ValueOption } from './types';

const BASE_SEARCH_KEY_BADGES: SearchKeyBadge[] = [
  {
    filterType: VirtualMachineRowFilterType.Name,
    getDescription: (t) => t('VM name - contains match (or just type free text)'),
    searchKey: 'name',
  },
  {
    filterType: VirtualMachineRowFilterType.Project,
    getDescription: (t) => t('Namespace / project e.g. project:default,openshift'),
    searchKey: 'project',
  },
  {
    filterType: VirtualMachineRowFilterType.Status,
    getDescription: (t) => t('VM status e.g. status:running,error'),
    searchKey: 'status',
  },
  {
    filterType: VirtualMachineRowFilterType.CPU,
    getDescription: (t) => t('vCPU count e.g. vcpu >2 vcpu>4 (also supports > =)'),
    searchKey: 'vcpu',
    usesColon: false,
  },
  {
    filterType: VirtualMachineRowFilterType.StorageClass,
    getDescription: (t) => t('Storage class e.g. storage:gold,silver'),
    searchKey: 'storage',
  },
  {
    filterType: VirtualMachineRowFilterType.DateCreatedFrom,
    getDescription: (t) => t('Creation date e.g. created:today created:last-7-days'),
    searchKey: 'created',
  },
  {
    filterType: VirtualMachineRowFilterType.Scheduling,
    getDescription: (t) => t('Scheduling constraints e.g. scheduling:nodeSelector,affinityRules'),
    searchKey: 'scheduling',
  },
  {
    filterType: VirtualMachineRowFilterType.Description,
    getDescription: (t) => t('Free-text match in VM description e.g. description:database'),
    searchKey: 'description',
  },
  {
    filterType: VirtualMachineRowFilterType.OS,
    getDescription: (t) => t('Operating system e.g. os:CentOS,Fedora'),
    searchKey: 'os',
  },
  {
    filterType: VirtualMachineRowFilterType.Architecture,
    getDescription: (t) => t('CPU architecture e.g. arch:amd64,arm64'),
    searchKey: 'arch',
  },
  {
    filterType: VirtualMachineRowFilterType.Memory,
    getDescription: (t) => t('RAM e.g. memory>4GiB or memory>=8GiB'),
    searchKey: 'memory',
    usesColon: false,
  },
  {
    filterType: VirtualMachineRowFilterType.HWDevices,
    getDescription: (t) => t('Hardware capability e.g. has:gpu,host'),
    searchKey: 'has',
  },
  {
    filterType: VirtualMachineRowFilterType.Labels,
    getDescription: (t) => t('Metadata label e.g. label:app=database,app=frontend'),
    searchKey: 'label',
  },
  {
    filterType: VirtualMachineRowFilterType.Node,
    getDescription: (t) => t('Scheduled node e.g. node:worker-01,worker-02'),
    searchKey: 'node',
  },
  {
    filterType: VirtualMachineRowFilterType.GuestAgent,
    getDescription: (t) => t('Guest agent status e.g. guestagent:reporting,notReporting'),
    searchKey: 'guestagent',
  },
  {
    filterType: VirtualMachineRowFilterType.IP,
    getDescription: (t) => t('IP address e.g. ip:10.0.0.1'),
    searchKey: 'ip',
  },
  {
    filterType: VirtualMachineRowFilterType.NAD,
    getDescription: (t) => t('Network attachment definition e.g. network:default/my-network'),
    searchKey: 'network',
  },
];

const CLUSTER_BADGE: SearchKeyBadge = {
  filterType: VirtualMachineRowFilterType.Cluster,
  getDescription: (t) => t('Cluster name e.g. cluster:production,local-cluster'),
  searchKey: 'cluster',
};

export const ALL_SEARCH_KEY_BADGES = [CLUSTER_BADGE, ...BASE_SEARCH_KEY_BADGES];

export const getSearchKeyBadges = (isACMPage: boolean): SearchKeyBadge[] =>
  isACMPage ? ALL_SEARCH_KEY_BADGES : BASE_SEARCH_KEY_BADGES;

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

export const OPERATOR_OPTIONS: ValueOption[] = Object.values(NumberOperator).map((op) => ({
  label: numberOperatorInfo[op].text,
  value: numberOperatorInfo[op].sign,
}));
