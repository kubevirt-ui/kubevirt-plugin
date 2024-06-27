import React, { FC } from 'react';

import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { SelectList, SelectOption } from '@patternfly/react-core';

import { diskSourceFieldID } from '../../utils/constants';
import { DiskSourceOptionGroupItem } from '../../utils/types';

type DiskSourceSelectOptionsProps = {
  isEditingCreatedDisk?: boolean;
  isTemplate?: boolean;
  isVMRunning: boolean;
  items: DiskSourceOptionGroupItem[];
};

const DiskSourceSelectOptions: FC<DiskSourceSelectOptionsProps> = ({
  isEditingCreatedDisk,
  isTemplate = false,
  isVMRunning,
  items,
}) => {
  return (
    <SelectList>
      {items.map(({ description, id, label }) => {
        const isDisabled =
          (isVMRunning && id === SourceTypes.EPHEMERAL) ||
          (isTemplate && id === SourceTypes.UPLOAD);
        return (
          <SelectOption
            data-test-id={`${diskSourceFieldID}-select-${id}`}
            description={description}
            isDisabled={isDisabled || isEditingCreatedDisk}
            key={id}
            value={id}
          >
            {label}
          </SelectOption>
        );
      })}
    </SelectList>
  );
};

export default DiskSourceSelectOptions;
