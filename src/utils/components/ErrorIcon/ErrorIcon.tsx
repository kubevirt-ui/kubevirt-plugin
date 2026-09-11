import { type JSX } from 'react';

import { ExclamationCircleIcon } from '@patternfly/react-icons';

export const ErrorIcon = (): JSX.Element => (
  <ExclamationCircleIcon color="var(--pf-t--global--icon--color--status--danger--default)" />
);
