import { LabelProps } from '@patternfly/react-core';

export const INDICATOR_STATUSES: Record<string, LabelProps['status']> = {
  NoGuestAgent: 'warning',
  QuiesceFailed: 'danger',
};
