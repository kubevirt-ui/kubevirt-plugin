import { TFunction } from 'react-i18next';

export enum VirtualMachineDetailsTab {
  Configurations = 'configuration',
  Console = 'console',
  Details = 'details',
  Diagnostics = 'diagnostics',
  Environment = 'environment',
  Events = 'events',
  InitialRun = 'initial',
  Logs = 'logs',
  Metadata = 'metadata',
  Metrics = 'metrics',
  Network = 'network',
  Overview = '',
  Scheduling = 'scheduling',
  Snapshots = 'snapshots',
  SSH = 'ssh',
  Storage = 'storage',
  Tables = 'tables',
  YAML = 'yaml',
}

export const VirtualMachineConfigurationTabInner = new Set([
  VirtualMachineDetailsTab.Details,
  VirtualMachineDetailsTab.Metadata,
  VirtualMachineDetailsTab.Network,
  VirtualMachineDetailsTab.Scheduling,
  VirtualMachineDetailsTab.SSH,
  VirtualMachineDetailsTab.Storage,
  VirtualMachineDetailsTab.InitialRun,
]);

export const getVirtualMachineDetailsTabLabel = (
  t: TFunction,
): Partial<Record<VirtualMachineDetailsTab, string>> => ({
  [VirtualMachineDetailsTab.Configurations]: t('Configuration'),
  [VirtualMachineDetailsTab.Console]: t('Console'),
  [VirtualMachineDetailsTab.Details]: t('Details'),
  [VirtualMachineDetailsTab.Diagnostics]: t('Diagnostics'),
  [VirtualMachineDetailsTab.Environment]: t('Environment'),
  [VirtualMachineDetailsTab.Events]: t('Events'),
  [VirtualMachineDetailsTab.InitialRun]: t('Initial run'),
  [VirtualMachineDetailsTab.Metadata]: t('Metadata'),
  [VirtualMachineDetailsTab.Metrics]: t('Metrics'),
  [VirtualMachineDetailsTab.Network]: t('Network'),
  [VirtualMachineDetailsTab.Overview]: t('Overview'),
  [VirtualMachineDetailsTab.Scheduling]: t('Scheduling'),
  [VirtualMachineDetailsTab.Snapshots]: t('Snapshots'),
  [VirtualMachineDetailsTab.SSH]: t('SSH'),
  [VirtualMachineDetailsTab.Storage]: t('Storage'),
  [VirtualMachineDetailsTab.YAML]: t('YAML'),
});
