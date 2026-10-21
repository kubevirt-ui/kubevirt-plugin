import type { TFunction } from 'i18next';

import { CalculationMethod } from '@kubevirt-utils/resources/quotas/types';

import type { CalculationMethodContentMapper } from './types';

export const getCalculationMethodContentMapper = (
  t: TFunction,
): CalculationMethodContentMapper => ({
  [CalculationMethod.DedicatedVirtualResources]: {
    description: t(
      'Applies to both VMs and their associated pods, tracking quota usage separately for each resource type.',
    ),
    label: t('Dedicated virtual resources'),
    popover: t(
      'applies to both VMs and their associated pods, tracking quota usage separately for each resource type.',
    ),
  },
  [CalculationMethod.GuestEffectiveResources]: {
    description: t(
      'Applies to pods that run VM workloads, excluding memory overhead for a closer match to guest-requested resources. Useful when accounting for CPU allocation or overcommitment ratios while ignoring infrastructure overhead.',
    ),
    label: t('Guest effective resources'),
    popover: t('counts the full pod running the VM, excluding memory overhead.'),
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
    longLabel: t('VirtualMachineInstance (VMI) pod usage'),
    popover: t('counts the full pod running the VM, including overhead.'),
  },
});

export const calculationMethods: CalculationMethod[] = [
  CalculationMethod.DedicatedVirtualResources,
  CalculationMethod.VirtualResources,
  CalculationMethod.VmiPodUsage,
  CalculationMethod.GuestEffectiveResources,
];

export const DEFAULT_CALCULATION_METHOD = CalculationMethod.DedicatedVirtualResources;
