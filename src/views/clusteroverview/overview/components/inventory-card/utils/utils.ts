import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isUpstream } from '@kubevirt-utils/utils/utils';
import {
  RedExclamationCircleIcon,
  WatchK8sResultsObject,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { InProgressIcon, OffIcon, PausedIcon, SyncAltIcon } from '@patternfly/react-icons';

import { getVMStatus } from '../../../utils/utils';

import { KUBEVIRT_OS_IMAGES_NS, OPENSHIFT_OS_IMAGES_NS } from './constants';
import { flattenTemplates } from './flattenTemplates';

export const getOSImagesNS = (): string =>
  isUpstream ? KUBEVIRT_OS_IMAGES_NS : OPENSHIFT_OS_IMAGES_NS;

export const getTemplates = (resources) => {
  const vmTemplates = resources?.vmTemplates as WatchK8sResultsObject<V1Template[]>;
  const vms = resources?.vms as WatchK8sResultsObject<V1VirtualMachine[]>;
  return flattenTemplates({ vmTemplates, vms }) || [];
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
  Running: SyncAltIcon,
  Paused: PausedIcon,
  Stopped: OffIcon,
  Starting: InProgressIcon,
  Migrating: InProgressIcon,
  Stopping: InProgressIcon,
  Deleting: InProgressIcon,
  Provisioning: InProgressIcon,
  Terminating: InProgressIcon,
  CrashLoopBackOff: RedExclamationCircleIcon,
  ErrorUnschedulable: RedExclamationCircleIcon,
  ErrImagePull: RedExclamationCircleIcon,
  ImagePullBackOff: RedExclamationCircleIcon,
  ErrorPvcNotFound: RedExclamationCircleIcon,
  ErrorDataVolumeNotFound: RedExclamationCircleIcon,
  DataVolumeError: RedExclamationCircleIcon,
  Unknown: YellowExclamationTriangleIcon,
};

export const getVMStatusIcon = (status: string): React.ComponentClass | React.FC =>
  iconMap[status] || iconMap.Unknown;
