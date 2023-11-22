import * as React from 'react';

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

export const snapshotStatuses = {
  Error: 'Error',
  Failed: 'Failed',
  Succeeded: 'Succeeded',
  Unknown: 'Unknown',
};

const iconHandler = {
  get: (mapper: typeof iconMapper, prop: string) => {
    const icon = mapper[prop?.toLowerCase()];
    if (icon) return icon;
    return InProgressIcon;
  },
};

const iconMapper: { [key: string]: any } = {
  error: ExclamationCircleIcon,
  failed: ExclamationCircleIcon,
  succeeded: () => <CheckCircleIcon color="green" />,
  unknown: UnknownIcon,
};

export const icon = new Proxy<typeof iconMapper>(iconMapper, iconHandler);
