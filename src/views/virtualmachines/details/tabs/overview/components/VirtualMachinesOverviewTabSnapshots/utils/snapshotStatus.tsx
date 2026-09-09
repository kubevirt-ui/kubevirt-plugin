import { type ComponentType } from 'react';

import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { InProgressIcon, UnknownIcon } from '@patternfly/react-icons';

type SnapshotStatusIcon = ComponentType<object>;

const iconMapper: Record<string, SnapshotStatusIcon> = {
  error: RedExclamationCircleIcon,
  failed: RedExclamationCircleIcon,
  succeeded: GreenCheckCircleIcon,
  unknown: UnknownIcon,
};

const iconHandler: ProxyHandler<Record<string, SnapshotStatusIcon>> = {
  get: (mapper, prop: string): SnapshotStatusIcon => {
    const icon = mapper[prop?.toLowerCase()];
    return icon ?? InProgressIcon;
  },
};

export const icon = new Proxy(iconMapper, iconHandler);
