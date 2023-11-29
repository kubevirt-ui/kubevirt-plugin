import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NETWORK } from '@virtualmachines/utils';

export enum VirtualMachineDetailsTab {
  Configurations = 'configurations',
  Console = 'console',
  Details = 'details',
  Diagnostics = 'diagnostics',
  Disks = 'disks',
  Environment = 'environment',
  Events = 'events',
  'Initial-run' = 'initial',
  Metadata = 'metadata',
  Metrics = 'metrics',
  NetworkInterfaces = 'network-interfaces',
  Overview = '',
  Scheduling = 'scheduling',
  Scripts = 'scripts',
  Snapshots = 'snapshots',
  SSH = 'ssh',
  Storage = 'storage',
  YAML = 'yaml',
}

export const VirtualMachineConfigurationTabInner = {
  [VirtualMachineDetailsTab.Details]: VirtualMachineDetailsTab.Details,
  [VirtualMachineDetailsTab.Metadata]: VirtualMachineDetailsTab.Metadata,
  [VirtualMachineDetailsTab.NetworkInterfaces]: NETWORK,
  [VirtualMachineDetailsTab.Scheduling]: VirtualMachineDetailsTab.Scheduling,
  [VirtualMachineDetailsTab.SSH]: VirtualMachineDetailsTab.SSH,
  [VirtualMachineDetailsTab.Storage]: VirtualMachineDetailsTab.Storage,
  [VirtualMachineDetailsTab['Initial-run']]: VirtualMachineDetailsTab['Initial-run'],
};

export const VirtualMachineDetailsTabLabel = {
  Configuration: t('Configuration'),
  Console: t('Console'),
  Details: t('Details'),
  Diagnostics: t('Diagnostics'),
  Disks: t('Disks'),
  Environment: t('Environment'),
  Events: t('Events'),
  'Initial-run': t('Initial run'),
  Metadata: t('Metadata'),
  Metrics: t('Metrics'),
  NetworkInterfaces: t('Network interfaces'),
  Overview: t('Overview'),
  Scheduling: t('Scheduling'),
  Scripts: t('Scripts'),
  Snapshots: t('Snapshots'),
  SSH: t('SSH'),
  Storage: t('Storage'),
  YAML: t('YAML'),
};
