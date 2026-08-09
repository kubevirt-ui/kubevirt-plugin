import { type ComponentClass, type FC } from 'react';

import { type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { KUBEVIRT_OS_IMAGES_NS, OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { GreenRunningIcon } from '@kubevirt-utils/icons/GreenRunningIcon';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { isUpstream } from '@kubevirt-utils/utils/utils';
import {
  RedExclamationCircleIcon,
  type WatchK8sResultsObject,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { InProgressIcon, OffIcon, PausedIcon } from '@patternfly/react-icons';

import { type K8sResourceKind } from '../../../utils/types';
import { flattenTemplates } from './flattenTemplates';
import { type VirtualMachineTemplateBundle } from './types';

export const getOSImagesNS = (): string =>
  isUpstream ? KUBEVIRT_OS_IMAGES_NS : OPENSHIFT_OS_IMAGES_NS;

export const getTemplates = (resources: {
  vms?: WatchK8sResultsObject<V1VirtualMachine[]>;
  vmTemplates?: WatchK8sResultsObject<V1Template[]>;
}): VirtualMachineTemplateBundle[] => {
  const vmTemplates = resources?.vmTemplates as WatchK8sResultsObject<V1Template[]>;
  const vms = resources?.vms as WatchK8sResultsObject<V1VirtualMachine[]>;
  return flattenTemplates({ vms, vmTemplates }) || [];
};

export const getVMStatusCounts = (vms: K8sResourceKind[]): Record<string, number> => {
  const statusCounts: Record<string, number> = {};
  for (const vm of vms) {
    const status: string = getVMStatus(vm as V1VirtualMachine);
    const count: number = statusCounts[status] ?? 0;
    statusCounts[status] = count + 1;
  }

  return statusCounts;
};

export const iconMap = {
  CrashLoopBackOff: RedExclamationCircleIcon,
  DataVolumeError: RedExclamationCircleIcon,
  Deleting: InProgressIcon,
  ErrImagePull: RedExclamationCircleIcon,
  ErrorDataVolumeNotFound: RedExclamationCircleIcon,
  ErrorPvcNotFound: RedExclamationCircleIcon,
  ErrorUnschedulable: RedExclamationCircleIcon,
  ImagePullBackOff: RedExclamationCircleIcon,
  Migrating: InProgressIcon,
  Paused: PausedIcon,
  Provisioning: InProgressIcon,
  Running: GreenRunningIcon,
  Starting: InProgressIcon,
  Stopped: OffIcon,
  Stopping: InProgressIcon,
  Terminating: InProgressIcon,
  Unknown: YellowExclamationTriangleIcon,
};

export const getVMStatusIcon = (status: string): ComponentClass | FC =>
  iconMap[status] || iconMap.Unknown;
