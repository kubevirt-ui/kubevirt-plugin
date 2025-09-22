import React, { FC, useState } from 'react';

import { MenuToggleProps, Select, SelectList, SelectProps } from '@patternfly/react-core';

import SelectToggle from '../toggles/SelectToggle';

type FormPFSelectProps = Omit<SelectProps, 'isOpen' | 'toggle'> & {
  closeOnSelect?: boolean;
  isDisabled?: boolean;
  selectedLabel?: any;
  toggleProps?: MenuToggleProps;
};

/** PatternFly Select component wrapper for convenient usage. Options should be passed as children and shouldn't be wrapped in SelectList. */
const FormPFSelect: FC<FormPFSelectProps> = ({
  children,
  className,
  closeOnSelect = true,
  isDisabled = false,
  onSelect,
  selected,
  selectedLabel,
  toggleProps,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  return (
    <Select
      onSelect={(event, value) => {
        onSelect && onSelect(event, value);
        closeOnSelect && setIsOpen(false);
      }}
      toggle={SelectToggle({
        isDisabled,
        isExpanded: isOpen,
        onClick: onToggle,
        selected: selectedLabel || selected || toggleProps?.placeholder,
        ...toggleProps,
      })}
      className={className}
      isOpen={isOpen}
      isScrollable
      onOpenChange={(open: boolean) => setIsOpen(open)}
      selected={selected}
      {...props}
    >
      <SelectList>{children}</SelectList>
    </Select>
  );
};

export default FormPFSelect;
