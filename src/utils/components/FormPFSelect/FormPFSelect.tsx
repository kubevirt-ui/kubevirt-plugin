import React, { FC, useState } from 'react';

import { MenuToggleProps, Select, SelectList, SelectProps } from '@patternfly/react-core';

import SelectToggle from '../toggles/SelectToggle';

type FormPFSelectProps = Omit<SelectProps, 'isOpen' | 'toggle'> & {
  closeOnSelect?: boolean;
  isDisabled?: boolean;
  selectedLabel?: any;
  toggleProps?: MenuToggleProps;
};

/**
 * PatternFly Select component wrapper for convenient usage. Options should be passed as children and shouldn't be wrapped in SelectList.
 * @param root0
 * @param root0.children
 * @param root0.className
 * @param root0.closeOnSelect
 * @param root0.isDisabled
 * @param root0.onSelect
 * @param root0.selected
 * @param root0.selectedLabel
 * @param root0.toggleProps
 */
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
