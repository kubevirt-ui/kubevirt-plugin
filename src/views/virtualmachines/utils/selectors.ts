import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getNetworks = (vm: V1VirtualMachine) => vm?.spec?.template?.spec?.networks;

export const getInterfaces = (vm: V1VirtualMachine) =>
  vm?.spec?.template?.spec?.domain?.devices?.interfaces;
