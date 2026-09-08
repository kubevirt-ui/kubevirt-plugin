import * as ipaddr from 'ipaddr.js';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { getCluster } from '@multicluster/helpers/selectors';

import { type VMIMMapper } from './mappers';
import { printableVMStatus } from './virtualMachineStatuses';

export const isLiveMigratable = (vm: V1VirtualMachine): boolean =>
  vm?.status?.printableStatus === printableVMStatus.Running &&
  !!vm?.status?.conditions?.find(
    ({ status, type }) => type === 'LiveMigratable' && status === 'True',
  );

export const isRunning = (vm: V1VirtualMachine): boolean =>
  vm?.status?.printableStatus === printableVMStatus.Running;

export const compareCIDR = (ipSearch: string, ipAddress: string): boolean => {
  if (!ipaddr.isValidCIDR(ipSearch) || !ipaddr.isValid(ipAddress)) {
    return false;
  }
  return ipaddr.parse(ipAddress).match(ipaddr.parseCIDR(ipSearch));
};

export const sortVMIMByTimestampCreation = (
  a: V1VirtualMachineInstanceMigration,
  b: V1VirtualMachineInstanceMigration,
): number => {
  const timestampA = a.metadata?.creationTimestamp ?? '';
  const timestampB = b.metadata?.creationTimestamp ?? '';
  return timestampA.localeCompare(timestampB);
};

export const getLatestMigrationForEachVM = (
  vmims: V1VirtualMachineInstanceMigration[],
): VMIMMapper =>
  (Array.isArray(vmims) ? vmims : [])?.sort(sortVMIMByTimestampCreation)?.reduce((acc, vmim) => {
    const name = vmim?.spec?.vmiName;
    const namespace = vmim?.metadata?.namespace;
    const cluster = getCluster(vmim) ?? SINGLE_CLUSTER_KEY;

    if (!acc[cluster]) {
      acc[cluster] = {};
    }

    if (!acc[cluster][namespace]) {
      acc[cluster][namespace] = {};
    }

    acc[cluster][namespace][name] = vmim;

    return acc;
  }, {});
