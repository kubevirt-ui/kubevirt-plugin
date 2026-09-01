import { type TFunction } from 'i18next';

import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { type SearchKeyBadge } from './types';

export const SEARCH_KEY_BADGES: SearchKeyBadge[] = [
  {
    filterType: VirtualMachineRowFilterType.Name,
    getDescription: (t: TFunction): string =>
      t('VM name - contains match (or just type free text)'),
    searchKey: 'name',
  },
  {
    filterType: VirtualMachineRowFilterType.Cluster,
    getDescription: (t: TFunction): string =>
      t('Cluster name e.g. cluster:production,local-cluster'),
    searchKey: 'cluster',
  },
  {
    filterType: VirtualMachineRowFilterType.Project,
    getDescription: (t: TFunction): string =>
      t('Namespace / project e.g. project:default,openshift'),
    searchKey: 'project',
  },
  {
    filterType: VirtualMachineRowFilterType.Group,
    getDescription: (t: TFunction): string => t('Group (folder) e.g. group:production,staging'),
    searchKey: 'group',
  },
  {
    filterType: VirtualMachineRowFilterType.Status,
    getDescription: (t: TFunction): string => t('VM status e.g. status:running,error'),
    searchKey: 'status',
  },
  {
    filterType: VirtualMachineRowFilterType.CPU,
    getDescription: (t: TFunction): string =>
      t('vCPU count e.g. vcpu >2 vcpu>4 (also supports > =)'),
    searchKey: 'vcpu',
    usesColon: false,
  },
  {
    filterType: VirtualMachineRowFilterType.StorageClass,
    getDescription: (t: TFunction): string => t('Storage class e.g. storage:gold,silver'),
    searchKey: 'storage',
  },
  {
    filterType: VirtualMachineRowFilterType.DateCreated,
    getDescription: (t: TFunction): string =>
      t('Creation date e.g. created:today created:last-7-days created:from-2026-01-25'),
    searchKey: 'created',
  },
  {
    filterType: VirtualMachineRowFilterType.Scheduling,
    getDescription: (t: TFunction): string =>
      t('Scheduling constraints e.g. scheduling:nodeSelector,affinityRules'),
    searchKey: 'scheduling',
  },
  {
    filterType: VirtualMachineRowFilterType.Description,
    getDescription: (t: TFunction): string =>
      t('Free-text match in VM description e.g. description:database'),
    searchKey: 'description',
  },
  {
    filterType: VirtualMachineRowFilterType.OS,
    getDescription: (t: TFunction): string => t('Operating system e.g. os:CentOS,Fedora'),
    searchKey: 'os',
  },
  {
    filterType: VirtualMachineRowFilterType.Architecture,
    getDescription: (t: TFunction): string => t('CPU architecture e.g. arch:amd64,arm64'),
    searchKey: 'arch',
  },
  {
    filterType: VirtualMachineRowFilterType.Memory,
    getDescription: (t: TFunction): string => t('RAM e.g. memory>4GiB or memory>=8GiB'),
    searchKey: 'memory',
    usesColon: false,
  },
  {
    filterType: VirtualMachineRowFilterType.HWDevices,
    getDescription: (t: TFunction): string => t('Hardware capability e.g. has:gpu,host'),
    searchKey: 'has',
  },
  {
    filterType: VirtualMachineRowFilterType.Labels,
    getDescription: (t: TFunction): string =>
      t('Metadata label e.g. label:app=database,app=frontend'),
    searchKey: 'label',
  },
  {
    filterType: VirtualMachineRowFilterType.Node,
    getDescription: (t: TFunction): string => t('Scheduled node e.g. node:worker-01,worker-02'),
    searchKey: 'node',
  },
  {
    filterType: VirtualMachineRowFilterType.GuestAgent,
    getDescription: (t: TFunction): string =>
      t('Guest agent status e.g. guestagent:reporting,notReporting'),
    searchKey: 'guestagent',
  },
  {
    filterType: VirtualMachineRowFilterType.IP,
    getDescription: (t: TFunction): string => t('IP address e.g. ip:10.0.0.1'),
    searchKey: 'ip',
  },
  {
    filterType: VirtualMachineRowFilterType.NAD,
    getDescription: (t: TFunction): string =>
      t('Network attachment definition e.g. network:default/my-network'),
    searchKey: 'network',
  },
];
