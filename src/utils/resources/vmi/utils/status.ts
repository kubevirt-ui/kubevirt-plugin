import { ComponentClass, FC } from 'react';

import { GreenRunningIcon } from '@kubevirt-utils/icons/GreenRunningIcon';
import {
  ExclamationCircleIcon,
  InProgressIcon,
  OffIcon,
  PausedIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

export const vmiStatuses = {
  Failed: 'Failed',
  Migrating: 'Migrating',
  Paused: 'Paused',
  Provisioning: 'Provisioning',
  Running: 'Running',
  Starting: 'Starting',
  Stopped: 'Stopped',
  Stopping: 'Stopping',
  Terminating: 'Terminating',
  Unknown: 'Unknown',
};

export const osNames = ['centos', 'fedora', 'windows', 'rhel', 'other'];

const iconHandler = {
  get: (mapper: typeof iconMapper, prop: string) => {
    const icon = mapper[prop?.toLowerCase()];
    if (icon) return icon;
    return InProgressIcon;
  },
};

const iconMapper: { [key: string]: ComponentClass<any, any> | FC } = {
  error: ExclamationCircleIcon,
  failed: ExclamationCircleIcon,
  paused: PausedIcon,
  running: GreenRunningIcon,
  stopped: OffIcon,
  unknown: UnknownIcon,
};

export const icon = new Proxy<typeof iconMapper>(iconMapper, iconHandler);
