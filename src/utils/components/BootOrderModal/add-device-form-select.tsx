import React, { FC } from 'react';

import { BootableDeviceType } from '@kubevirt-utils/resources/vm/utils/boot-order/bootOrder';
import { Button, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

export const AddDeviceFormSelect: FC<AddDeviceFormSelectProps> = ({
  id,
  label,
  onAdd,
  onDelete,
  options,
}) => (
  <>
    <FormSelect
      className="kubevirt-boot-order__add-device-select"
      id={id}
      onChange={(_, value: string) => onAdd(value)}
      value=""
    >
      <FormSelectOption label={label} value="" />
      {options.map((option) => (
        <FormSelectOption
          key={option.value.name}
          label={`${option.value.name} (${option.typeLabel})`}
          value={option.value.name}
        />
      ))}
    </FormSelect>
    <Button
      className="kubevirt-boot-order__add-device-delete-btn"
      onClick={onDelete}
      variant="link"
    >
      <MinusCircleIcon />
    </Button>
  </>
);

export type AddDeviceFormSelectProps = {
  id: string;
  label: string;
  /** onAdd moves items from the options list to the sources list, key = "<type>-<name>". */
  onAdd: (key: string) => void;
  onDelete: () => void;
  options: BootableDeviceType[];
};
