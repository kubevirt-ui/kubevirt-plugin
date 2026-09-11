import type { FC } from 'react';

import type { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { SelectOption } from '@patternfly/react-core';

import type { DiskSourceOptionGroupItem } from '../../utils/types';

type DiskSourceOptionProps = {
  onSelect: (value: SourceTypes) => void;
} & DiskSourceOptionGroupItem;

const DiskSourceOption: FC<DiskSourceOptionProps> = ({
  description,
  id,
  isDisabled,
  label,
  onSelect,
}) => (
  <SelectOption
    description={description}
    isDisabled={isDisabled}
    itemId={id}
    key={id}
    onClick={() => onSelect(id)}
  >
    {label}
  </SelectOption>
);

export default DiskSourceOption;
