import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { DiskFormState, SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { SelectList, SelectOption } from '@patternfly/react-core';

import { diskSourceFieldID } from '../../utils/constants';
import { DiskSourceOptionGroupItem } from '../../utils/types';

type DiskSourceSelectOptionsProps = {
  isTemplate?: boolean;
  isVMRunning: boolean;
  items: DiskSourceOptionGroupItem[];
};

const DiskSourceSelectOptions: FC<DiskSourceSelectOptionsProps> = ({
  isTemplate,
  isVMRunning,
  items,
}) => {
  const { watch } = useFormContext<DiskFormState>();

  const diskType = watch('diskType');
  const isCDROMType = diskType === diskTypes.cdrom;
  return (
    <SelectList>
      {items.map(({ description, id, label }) => {
        const isDisabled =
          (isVMRunning && id === SourceTypes.EPHEMERAL) ||
          (isCDROMType && id === SourceTypes.BLANK) ||
          (isTemplate && id === SourceTypes.UPLOAD);
        return (
          <SelectOption
            data-test-id={`${diskSourceFieldID}-select-${id}`}
            description={description}
            isDisabled={isDisabled}
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
