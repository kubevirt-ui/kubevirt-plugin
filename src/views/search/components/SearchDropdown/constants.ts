import { TFunction } from 'i18next';

import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { SearchExample, SearchKeyBadge } from './types';

export const getSearchKeyBadges = (t: TFunction): SearchKeyBadge[] => [
  {
    description: t('VM name - contains match (or just type free text)'),
    displayKey: 'name',
    filterType: VirtualMachineRowFilterType.Name,
  },
  {
    description: t('Namespace / project e.g. project:default,openshift'),
    displayKey: 'project',
    filterType: VirtualMachineRowFilterType.Project,
  },
  {
    description: t('VM status e.g. status:running,error'),
    displayKey: 'status',
    filterType: VirtualMachineRowFilterType.Status,
  },
  {
    description: t('vCPU count e.g. vcpu >2 vcpu>4 (also supports > =)'),
    displayKey: 'vcpu',
    filterType: VirtualMachineRowFilterType.CPU,
    usesColon: false,
  },
  {
    description: t('Storage class e.g. storage:gold,silver'),
    displayKey: 'storage',
    filterType: VirtualMachineRowFilterType.StorageClass,
  },
  {
    description: t('Creation date e.g. created:today created:last-7-days'),
    displayKey: 'created',
    filterType: VirtualMachineRowFilterType.DateCreatedFrom,
  },
  {
    description: t('Scheduling constraints e.g. scheduling:nodeSelector,affinityRules'),
    displayKey: 'scheduling',
    filterType: VirtualMachineRowFilterType.Scheduling,
  },
  {
    description: t('Cluster name e.g. cluster:production,local-cluster'),
    displayKey: 'cluster',
    filterType: VirtualMachineRowFilterType.Cluster,
  },
  {
    description: t('Free-text match in VM description e.g. description:database'),
    displayKey: 'description',
    filterType: VirtualMachineRowFilterType.Description,
  },
  {
    description: t('Operating system e.g. os:CentOS,Fedora'),
    displayKey: 'os',
    filterType: VirtualMachineRowFilterType.OS,
  },
  {
    description: t('RAM e.g. memory>4GiB or memory>=8GiB'),
    displayKey: 'memory',
    filterType: VirtualMachineRowFilterType.Memory,
    usesColon: false,
  },
  {
    description: t('Hardware capability e.g. has:gpu,host'),
    displayKey: 'has',
    filterType: VirtualMachineRowFilterType.HWDevices,
  },
  {
    description: t('Metadata label e.g. label:app=database,app=frontend'),
    displayKey: 'label',
    filterType: VirtualMachineRowFilterType.Labels,
  },
  {
    description: t('Scheduled node e.g. node:worker-01,worker-02'),
    displayKey: 'node',
    filterType: VirtualMachineRowFilterType.Node,
  },
];

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
