import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { MAX_K8S_NAME_LENGTH } from '@kubevirt-utils/utils/constants';
import { getRandomChars, truncateToK8sName } from '@kubevirt-utils/utils/utils';

import { MIGPLAN_PREFIX } from './constants';

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
