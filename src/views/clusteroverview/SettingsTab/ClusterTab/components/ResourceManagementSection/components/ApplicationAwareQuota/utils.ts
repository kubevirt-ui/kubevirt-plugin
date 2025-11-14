import { TFunction } from 'react-i18next';

import { ResourceCountingType } from './types';

export const getOptions = (
  t: TFunction,
): { description: string; label: string; value: ResourceCountingType }[] => [
  {
    description: t(
      'Counts compute resources for pods associated with VMs in the same way as native resource quotas and excludes migration-related resources.',
    ),
    label: 'VmiPodUsage',
    value: 'VmiPodUsage',
  },
  {
    description: t(
      'Counts compute resources based on the VM specifications, using the VM RAM size for memory and virtual CPUs for processing.',
    ),
    label: 'VirtualResources',
    value: 'VirtualResources',
  },
  {
    description: t(
      'Similar to VirtualResources, but separates resource tracking for pods associated with VMs by adding a /vmi suffix to CPU and memory resource names. For example, requests.cpu/vmi and requests.memory/vmi.',
    ),
    label: 'DedicatedVirtualResources',
    value: 'DedicatedVirtualResources',
  },
];
