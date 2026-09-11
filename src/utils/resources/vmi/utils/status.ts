import { type ComponentClass, type FC } from 'react';

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

const iconMapper = {
  error: ExclamationCircleIcon,
  failed: ExclamationCircleIcon,
  paused: PausedIcon,
  running: GreenRunningIcon,
  stopped: OffIcon,
  unknown: UnknownIcon,
};

type IconComponent = (typeof iconMapper)[keyof typeof iconMapper];

const iconHandler = {
  get: (mapper: typeof iconMapper, prop: string): IconComponent => {
    const icon = mapper[prop?.toLowerCase() as keyof typeof iconMapper];
    return icon ?? InProgressIcon;
  },
};

export const getVMIPhaseIcon = (phase: string | undefined): ComponentClass | FC => {
  const iconComponent = iconMapper[phase?.toLowerCase() as keyof typeof iconMapper];
  return iconComponent ?? InProgressIcon;
};

export const icon = new Proxy(iconMapper, iconHandler);
