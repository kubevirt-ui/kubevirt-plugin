import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { MAX_K8S_NAME_LENGTH } from '@kubevirt-utils/utils/constants';
import { getRandomChars } from '@kubevirt-utils/utils/utils';

import { MIGPLAN_PREFIX } from './constants';

export const truncateToK8sName = (
  name: string,
  suffix: string = getRandomChars(),
  maxLength = MAX_K8S_NAME_LENGTH,
): string => {
  const separator = suffix ? '-' : '';
  const fullName = `${name}${separator}${suffix}`;

  if (fullName.length <= maxLength) {
    return fullName;
  }

  const allowedNameLength = maxLength - separator.length - suffix.length;
  return `${name.slice(0, allowedNameLength)}${separator}${suffix}`;
};

export const sanitizeK8sResourceName = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .slice(0, MAX_K8S_NAME_LENGTH);

export const generateMigPlanName = (vms: V1VirtualMachine[]): string => {
  const vmNames = vms.map((vm) => getName(vm)).filter(Boolean);
  const vmPart = vmNames.length === 1 ? vmNames[0] : `${vmNames.length || 0}vms`;

  return truncateToK8sName(`${MIGPLAN_PREFIX}-${vmPart}`, getRandomChars());
};
