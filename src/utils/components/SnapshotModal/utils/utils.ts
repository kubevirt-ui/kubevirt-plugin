import { format } from 'date-fns';

import {
  type V1beta1VirtualMachineSnapshot,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { buildOwnerReference, getName } from '@kubevirt-utils/resources/shared';
import { MAX_K8S_NAME_LENGTH } from '@kubevirt-utils/utils/constants';
import { type deadlineUnits } from '@virtualmachines/details/tabs/snapshots/utils/consts';
import { getEmptyVMSnapshotResource } from '@virtualmachines/details/tabs/snapshots/utils/helpers';

const DEFAULT_SUFFIX_LENGTH = 'snapshot-yyyyMMdd-kkmmss'.length as 24;
const MAX_REST_LENGTH = (MAX_K8S_NAME_LENGTH - DEFAULT_SUFFIX_LENGTH) as 39;
const RANDOM_CHARS_LENGTH = 8; // -{random 6 characters}-

export const generateSnapshotName = (vm: V1VirtualMachine): string => {
  const vmName = getName(vm);
  return `${vmName.substring(0, MAX_REST_LENGTH - 1)}-${generateSnapshotSuffix()}`;
};

export const generateSnapshotSuffix = (): string => {
  const date = new Date();
  const formattedDate = format(date, 'yyyyMMdd-kkmmss');
  return `snapshot-${formattedDate}`;
};

export const getMaxSuffixLength = (vmNameLength: number): number => {
  const restLength = vmNameLength + RANDOM_CHARS_LENGTH;

  if (restLength > MAX_REST_LENGTH) {
    return DEFAULT_SUFFIX_LENGTH;
  }

  return MAX_K8S_NAME_LENGTH - restLength;
};

export const getMaxVMNameLength = (suffixLength: number): number => {
  return MAX_K8S_NAME_LENGTH - suffixLength - RANDOM_CHARS_LENGTH;
};

export const generateSnapshot = (
  vm: V1VirtualMachine,
  snapshotName: string,
  description: string,
  deadline: string,
  deadlineUnit: deadlineUnits,
): V1beta1VirtualMachineSnapshot => {
  const snapshot = getEmptyVMSnapshotResource(vm);
  const ownerReference = buildOwnerReference(vm, { blockOwnerDeletion: false });

  snapshot.metadata.name = snapshotName;
  snapshot.metadata.ownerReferences = [ownerReference];
  if (description) {
    snapshot.metadata.annotations = { description };
  }
  if (deadline) {
    snapshot.spec.failureDeadline = `${deadline}${deadlineUnit}`;
  }

  return snapshot;
};
