import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { getCluster } from '@multicluster/helpers/selectors';

import { printableVMStatus } from './virtualMachineStatuses';

export const isLiveMigratable = (vm: V1VirtualMachine): boolean =>
  vm?.status?.printableStatus === printableVMStatus.Running &&
  !!vm?.status?.conditions?.find(
    ({ status, type }) => type === 'LiveMigratable' && status === 'True',
  );

export const isRunning = (vm: V1VirtualMachine): boolean =>
  vm?.status?.printableStatus === printableVMStatus.Running;

export const decimalToBinary = (decimalNumber: number) => (decimalNumber >>> 0).toString(2);

const ipStringToBinary = (ip: string) =>
  ip
    .split('.')
    .map((classes) => decimalToBinary(parseInt(classes)).padStart(8, '0'))
    .join('');

const isValidIP = (ip: string) =>
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2]?\d))?$/.test(
    ip,
  );

export const compareCIDR = (ipSearch: string, ip: string) => {
  if (!isValidIP(ipSearch)) {
    return false;
  }

  const [baseIp, range] = ipSearch.split('/');
  const baseIpBinary = ipStringToBinary(baseIp);
  const ipBinary = ipStringToBinary(ip);
  const rangeNumber = parseInt(range);
  const baseIpBinarySlice = baseIpBinary.slice(0, rangeNumber);
  const ipBinarySlice = ipBinary.slice(0, rangeNumber);

  return baseIpBinarySlice === ipBinarySlice;
};

export const sortVMIMByTimestampCreation = (
  a: V1VirtualMachineInstanceMigration,
  b: V1VirtualMachineInstanceMigration,
) => {
  return a.metadata.creationTimestamp.localeCompare(b.metadata.creationTimestamp);
};

export const getLatestMigrationForEachVM = (vmims: V1VirtualMachineInstanceMigration[]) =>
  (Array.isArray(vmims) ? vmims : [])?.sort(sortVMIMByTimestampCreation)?.reduce((acc, vmim) => {
    const name = vmim?.spec?.vmiName;
    const namespace = vmim?.metadata?.namespace;
    const cluster = getCluster(vmim) || SINGLE_CLUSTER_KEY;

    if (!acc[cluster]) {
      acc[cluster] = {};
    }

    if (!acc[cluster][namespace]) {
      acc[cluster][namespace] = {};
    }

    acc[cluster][namespace][name] = vmim;

    return acc;
  }, {});
