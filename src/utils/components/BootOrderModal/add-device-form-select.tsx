import * as React from 'react';

import { BootableDeviceType } from '@kubevirt-utils/resources/vm/utils/boot-order/bootOrder';
import { Button, FormSelect, FormSelectOption } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

export const AddDeviceFormSelect: React.FC<AddDeviceFormSelectProps> = ({
  id,
  options,
  label,
  onAdd,
  onDelete,
}) => (
  <>
    <FormSelect
      value=""
      id={id}
      onChange={onAdd}
      className="kubevirt-boot-order__add-device-select"
    >
      <FormSelectOption label={label} value="" />
      {options.map((option) => (
        <FormSelectOption
          label={`${option.value.name} (${option.typeLabel})`}
          value={option.value.name}
          key={option.value.name}
        />
      ))}
    </FormSelect>
    <Button
      onClick={onDelete}
      variant="link"
      className="kubevirt-boot-order__add-device-delete-btn"
    >
      <MinusCircleIcon />
    </Button>
  </>
);

export type AddDeviceFormSelectProps = {
  id: string;
  options: BootableDeviceType[];
  label: string;
  onDelete: () => void;
  /** onAdd moves items from the options list to the sources list, key = "<type>-<name>". */
  onAdd: (key: string) => void;
};
