import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { printableVMStatus } from './virtualMachineStatuses';

export const isLiveMigratable = (vm: V1VirtualMachine, isSingleNodeCluster: boolean): boolean =>
  !isSingleNodeCluster &&
  vm?.status?.printableStatus === printableVMStatus.Running &&
  !!vm?.status?.conditions?.find(
    ({ status, type }) => type === 'LiveMigratable' && status === 'True',
  );

export const isRunning = (vm: V1VirtualMachine): boolean =>
  vm?.status?.printableStatus === printableVMStatus.Running;

const decimalToBinary = (decimalNumber: number) => (decimalNumber >>> 0).toString(2);

const ipStringToBinary = (ip: string) =>
  ip
    .split('.')
    .map((classes) => decimalToBinary(parseInt(classes)).padStart(8, '0'))
    .join('');

export const compareCIDR = (ipSearch: string, ip: string) => {
  const [baseIp, range] = ipSearch.split('/');

  const baseIpBinary = ipStringToBinary(baseIp);

  const ipBinary = ipStringToBinary(ip);

  const rangeNumber = parseInt(range);

  const baseIpBinarySlice = baseIpBinary.slice(0, rangeNumber);
  const ipBinarySlice = ipBinary.slice(0, rangeNumber);

  return baseIpBinarySlice === ipBinarySlice;
};
