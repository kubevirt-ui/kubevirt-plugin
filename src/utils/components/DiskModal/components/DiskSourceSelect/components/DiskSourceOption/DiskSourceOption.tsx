import React, { FC } from 'react';

import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { SelectOption } from '@patternfly/react-core';

import { DiskSourceOptionGroupItem } from '../../utils/types';

type DiskSourceOptionProps = {
  onSelect: (value: SourceTypes) => void;
} & DiskSourceOptionGroupItem;

const DiskSourceOption: FC<DiskSourceOptionProps> = ({ description, id, label, onSelect }) => (
  <SelectOption description={description} itemId={id} key={id} onClick={() => onSelect(id)}>
    {label}
  </SelectOption>
);

export default DiskSourceOption;
