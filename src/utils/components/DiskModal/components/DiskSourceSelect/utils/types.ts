import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';

export type DiskSourceOptionGroupItem = {
  description?: string;
  id: SourceTypes;
  label: string;
};

export type DiskSourceOptionGroup = {
  groupLabel?: string;
  items: DiskSourceOptionGroupItem[];
};
