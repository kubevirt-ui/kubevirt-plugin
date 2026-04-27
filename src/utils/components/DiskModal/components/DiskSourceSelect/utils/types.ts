import { ReactNode } from 'react';

import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';

export type DiskSourceOptionGroupItem = {
  description?: string;
  id: SourceTypes;
  isDisabled?: boolean;
  label: ReactNode;
};

export type DiskSourceOptionGroup = {
  groupLabel?: string;
  items: DiskSourceOptionGroupItem[];
};
