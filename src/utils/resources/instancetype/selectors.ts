import { InstanceTypeUnion } from './types';

export const getInstanceTypeCPU = (resource: InstanceTypeUnion) => resource?.spec?.cpu?.guest;

export const getInstanceTypeMemory = (resource: InstanceTypeUnion) => resource?.spec?.memory?.guest;
