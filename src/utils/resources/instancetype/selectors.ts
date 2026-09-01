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

export const getInstanceTypeRevisionName = (vm: VMWithRevisionRefs): string | undefined =>
  vm?.status?.instancetypeRef?.controllerRevisionRef?.name;

export const getPreferenceRevisionName = (vm: VMWithRevisionRefs): string | undefined =>
  vm?.status?.preferenceRef?.controllerRevisionRef?.name;
