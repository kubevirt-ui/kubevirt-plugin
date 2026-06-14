import { TFunction } from 'i18next';

import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { SearchExample, SearchKeyBadge } from './types';

export const SEARCH_KEY_BADGES: SearchKeyBadge[] = [
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
    filterType: VirtualMachineRowFilterType.Cluster,
    getDescription: (t) => t('Cluster name e.g. cluster:production,local-cluster'),
    searchKey: 'cluster',
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
];

export const SEARCH_KEYS = SEARCH_KEY_BADGES.map((badge) => badge.searchKey);

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
    description: t('Windows VMs in cnv-ui'),
    query: 'os:Windows project:cnv-ui',
  },
  {
    description: t('VMs with more than 8 GiB memory'),
    query: 'memory>8GiB',
  },
];

export const DEFAULT_VISIBLE_EXAMPLES = 3;
