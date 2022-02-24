import {
  ExclamationCircleIcon,
  InProgressIcon,
  OffIcon,
  PausedIcon,
  SyncAltIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

export const vmiStatuses = {
  Stopped: 'Stopped',
  Migrating: 'Migrating',
  Provisioning: 'Provisioning',
  Starting: 'Starting',
  Running: 'Running',
  Paused: 'Paused',
  Stopping: 'Stopping',
  Terminating: 'Terminating',
  Unknown: 'Unknown',
  Failed: 'Failed',
};

export const osNames = ['centos', 'fedora', 'windows', 'opensuse', 'rhel', 'ubuntu'];

const iconHandler = {
  get: (mapper: typeof iconMapper, prop: string) => {
    const icon = mapper[prop?.toLowerCase()];
    if (icon) return icon;
    return InProgressIcon;
  },
};

const iconMapper: { [key: string]: React.ComponentClass<any, any> } = {
  running: SyncAltIcon,
  paused: PausedIcon,
  unknown: UnknownIcon,
  error: ExclamationCircleIcon,
  failed: ExclamationCircleIcon,
  stopped: OffIcon,
};

export const icon = new Proxy<typeof iconMapper>(iconMapper, iconHandler);
