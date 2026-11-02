import { type TFunction } from 'i18next';

import { getCPUMemoryDisplayValue } from '@kubevirt-utils/resources/vm';

import { type InstanceTypeUnion } from './types';

type VMWithRevisionRefs = {
  status?: {
    instancetypeRef?: { controllerRevisionRef?: { name?: string } };
    preferenceRef?: { controllerRevisionRef?: { name?: string } };
  };
};

export const getInstanceTypeCPU = (resource: InstanceTypeUnion): number | undefined =>
  resource?.spec?.cpu?.guest;

export const getInstanceTypeMemory = (resource: InstanceTypeUnion): number | string | undefined =>
  resource?.spec?.memory?.guest;

export const getInstanceTypeCPUMemoryDisplayText = (
  instanceType: InstanceTypeUnion | undefined,
  t: TFunction,
): string | undefined => {
  if (!instanceType) {
    return undefined;
  }
  const cpuCount = getInstanceTypeCPU(instanceType);
  const memory = getInstanceTypeMemory(instanceType)?.toString();
  return getCPUMemoryDisplayValue(cpuCount ? { cores: cpuCount } : undefined, memory, t)
    .cpuMemoryText;
};

export const getInstanceTypeRevisionName = (vm: VMWithRevisionRefs): string | undefined =>
  vm?.status?.instancetypeRef?.controllerRevisionRef?.name;

export const getPreferenceRevisionName = (vm: VMWithRevisionRefs): string | undefined =>
  vm?.status?.preferenceRef?.controllerRevisionRef?.name;
