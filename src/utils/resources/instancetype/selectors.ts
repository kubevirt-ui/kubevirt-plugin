import { InstanceTypeUnion } from './types';

export const getInstanceTypeCPU = (resource: InstanceTypeUnion) => resource?.spec?.cpu?.guest;

export const getInstanceTypeMemory = (resource: InstanceTypeUnion) => resource?.spec?.memory?.guest;

//TODO: update kubvirt-api definion to include vm.status.instancetypeRef/preferenceRef
export const getInstanceTypeRevisionName = (vm: any) =>
  vm?.status?.instancetypeRef?.controllerRevisionRef?.name;

export const getPreferenceRevisionName = (vm: any) =>
  vm?.status?.preferenceRef?.controllerRevisionRef?.name;
