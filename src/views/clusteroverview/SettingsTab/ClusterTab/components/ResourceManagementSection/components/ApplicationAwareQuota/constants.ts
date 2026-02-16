import { TFunction } from 'react-i18next';

import { CalculationMethod } from '@kubevirt-utils/resources/quotas/types';

import { CalculationMethodContentMapper } from './types';

export const getCalculationMethodContentMapper = (
  t: TFunction,
): CalculationMethodContentMapper => ({
  [CalculationMethod.DedicatedVirtualResources]: {
    description: t(
      'Applies to both VMs and their associated pods, tracking quota usage separately for each resource type.',
    ),
    label: t('Dedicated virtual resources'),
    popover: t(
      'Applies to both VMs and their associated pods, tracking quota usage separately for each resource type.',
    ),
  },
  [CalculationMethod.VirtualResources]: {
    description: t(
      'Applies only to VM specific resources, excluding pod overhead from the calculations.',
    ),
    label: t('Virtual resources'),
    popover: t('counts only VM resources, while pod overhead is excluded.'),
  },
  [CalculationMethod.VmiPodUsage]: {
    description: t(
      'Applies to pods that run VM workloads. Resource usage includes both VM and pod overhead.',
    ),
    label: t('VMI pod usage'),
    longLabel: t('Virtual Machine Instance (VMI) pod usage'),
    popover: t('counts the full pod running the VM, including overhead.'),
  },
});

export const calculationMethods: CalculationMethod[] = [
  CalculationMethod.VirtualResources,
  CalculationMethod.VmiPodUsage,
  CalculationMethod.DedicatedVirtualResources,
];
