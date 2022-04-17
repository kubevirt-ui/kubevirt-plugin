import * as React from 'react';

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

export const snapshotStatuses = {
  Succeeded: 'Succeeded',
  Unknown: 'Unknown',
  Failed: 'Failed',
  Error: 'Error',
};

const iconHandler = {
  get: (mapper: typeof iconMapper, prop: string) => {
    const icon = mapper[prop?.toLowerCase()];
    if (icon) return icon;
    return InProgressIcon;
  },
};

const iconMapper: { [key: string]: any } = {
  succeeded: () => <CheckCircleIcon color="green" />,
  unknown: UnknownIcon,
  error: ExclamationCircleIcon,
  failed: ExclamationCircleIcon,
};

export const icon = new Proxy<typeof iconMapper>(iconMapper, iconHandler);
