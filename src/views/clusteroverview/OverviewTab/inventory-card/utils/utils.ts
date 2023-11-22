import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { KUBEVIRT_OS_IMAGES_NS, OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { isUpstream } from '@kubevirt-utils/utils/utils';
import {
  RedExclamationCircleIcon,
  WatchK8sResultsObject,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { InProgressIcon, OffIcon, PausedIcon, SyncAltIcon } from '@patternfly/react-icons';

import { flattenTemplates } from './flattenTemplates';

export const getOSImagesNS = (): string =>
  isUpstream ? KUBEVIRT_OS_IMAGES_NS : OPENSHIFT_OS_IMAGES_NS;

export const getTemplates = (resources) => {
  const vmTemplates = resources?.vmTemplates as WatchK8sResultsObject<V1Template[]>;
  const vms = resources?.vms as WatchK8sResultsObject<V1VirtualMachine[]>;
  return flattenTemplates({ vms, vmTemplates }) || [];
};

export const getVMStatusCounts = (vms) => {
  const statusCounts = {};
  vms.forEach((vm) => {
    const status = getVMStatus(vm);
    const count = statusCounts[status] || 0;
    statusCounts[status] = count + 1;
  });

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
  Running: SyncAltIcon,
  Starting: InProgressIcon,
  Stopped: OffIcon,
  Stopping: InProgressIcon,
  Terminating: InProgressIcon,
  Unknown: YellowExclamationTriangleIcon,
};

export const getVMStatusIcon = (status: string): React.ComponentClass | React.FC =>
  iconMap[status] || iconMap.Unknown;
