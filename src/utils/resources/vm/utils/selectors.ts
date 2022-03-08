import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getNetworks = (vm: V1VirtualMachine) => vm?.spec?.template?.spec?.networks;

export const getInterfaces = (vm: V1VirtualMachine) =>
  vm?.spec?.template?.spec?.domain?.devices?.interfaces;

export const getDisks = (vm: V1VirtualMachine) => vm?.spec?.template?.spec?.domain?.devices?.disks;

export const getVolumes = (vm: V1VirtualMachine) => vm?.spec?.template?.spec?.volumes;

export const getGPUDevices = (vm: V1VirtualMachine) =>
  vm?.spec?.template?.spec?.domain?.devices?.gpus;

export const getHostDevices = (vm: V1VirtualMachine) =>
  vm?.spec?.template?.spec?.domain?.devices?.hostDevices;
