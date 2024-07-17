import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';

export type DiskSourceFlyoutMenuProps = {
  className?: string;
  isTemplate?: boolean;
  onSelect: (value: SourceTypes) => void;
};
