import {
  ExclamationCircleIcon,
  InProgressIcon,
  OffIcon,
  PausedIcon,
  SyncAltIcon,
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

const iconMapper: { [key: string]: React.ComponentClass<any, any> } = {
  error: ExclamationCircleIcon,
  failed: ExclamationCircleIcon,
  paused: PausedIcon,
  running: SyncAltIcon,
  stopped: OffIcon,
  unknown: UnknownIcon,
};

export const icon = new Proxy<typeof iconMapper>(iconMapper, iconHandler);
