import { NETWORK } from '@virtualmachines/utils';

export enum VirtualMachineDetailsTab {
  Configurations = 'configurations',
  Console = 'console',
  Details = 'details',
  Diagnostics = 'diagnostics',
  Disks = 'disks',
  Environment = 'environment',
  Events = 'events',
  Metrics = 'metrics',
  NetworkInterfaces = 'network-interfaces',
  Overview = '',
  Scheduling = 'scheduling',
  Scripts = 'scripts',
  Snapshots = 'snapshots',
  YAML = 'yaml',
}

export const VirtualMachineConfigurationTabInner = {
  [VirtualMachineDetailsTab.Disks]: VirtualMachineDetailsTab.Disks,
  [VirtualMachineDetailsTab.Environment]: VirtualMachineDetailsTab.Environment,
  [VirtualMachineDetailsTab.NetworkInterfaces]: NETWORK,
  [VirtualMachineDetailsTab.Scheduling]: VirtualMachineDetailsTab.Scheduling,
  [VirtualMachineDetailsTab.Scripts]: VirtualMachineDetailsTab.Scripts,
};

export enum VirtualMachineDetailsTabLabel {
  // t('Configuration')
  Configuration = 'Configuration',
  // t('Console')
  Console = 'Console',
  // t('Details')
  Details = 'Details',
  // t('Diagnostics')
  Diagnostics = 'Diagnostics',
  // t('Disks')
  Disks = 'Disks',
  // t('Environment')
  Environment = 'Environment',
  // t('Events')
  Events = 'Events',
  // t('Metrics')
  Metrics = 'Metrics',
  // t('Network interfaces')
  NetworkInterfaces = 'Network interfaces',
  // t('Overview')
  Overview = 'Overview',
  // t('Scheduling')
  Scheduling = 'Scheduling',
  // t('Scripts')
  Scripts = 'Scripts',
  // t('Snapshots')
  Snapshots = 'Snapshots',
  // t('YAML')
  YAML = 'YAML',
}
