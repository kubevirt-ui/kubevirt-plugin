import React, { FC, useState } from 'react';

import { MenuToggleProps, Select, SelectProps } from '@patternfly/react-core';

import SelectToggle from '../toggles/SelectToggle';

type FormPFSelectProps = Omit<SelectProps, 'isOpen' | 'toggle'> & {
  closeOnSelect?: boolean;
  selectedLabel?: any;
  toggleProps?: MenuToggleProps;
};

const FormPFSelect: FC<FormPFSelectProps> = ({
  children,
  className,
  closeOnSelect = true,
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
      {children}
    </Select>
  );
};

export default FormPFSelect;
