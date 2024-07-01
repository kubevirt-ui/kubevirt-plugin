import { ReactNode } from 'react';

import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';

export type DiskSourceOptionGroupItem = {
  description?: string;
  id: SourceTypes;
  label: ReactNode | string;
};

export type DiskSourceOptionGroup = {
  description?: string;
  groupLabel?: string;
  items: DiskSourceOptionGroupItem[];
};
