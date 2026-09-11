import { type FC, type JSX, type ReactNode, useState } from 'react';

import { Select, SelectList, type SelectProps } from '@patternfly/react-core';

import SelectToggle, { type MenuTogglePropsWithTestId } from '../toggles/SelectToggle';

import './FormPFSelect.scss';

type FormPFSelectProps = Omit<SelectProps, 'isOpen' | 'selected' | 'toggle'> & {
  children?: ReactNode;
  closeOnSelect?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  selected?: string | readonly string[] | number | undefined;
  selectedLabel?: ReactNode;
  toggleProps?: MenuTogglePropsWithTestId;
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
 * @param root0.placeholder
 */
const FormPFSelect: FC<FormPFSelectProps> = ({
  children,
  className,
  closeOnSelect = true,
  isDisabled = false,
  onSelect,
  placeholder,
  selected,
  selectedLabel,
  toggleProps,
  ...props
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = (): void => setIsOpen((prevIsOpen) => !prevIsOpen);

  return (
    <Select
      className={className}
      isOpen={isOpen}
      isScrollable
      onOpenChange={(open: boolean) => setIsOpen(open)}
      onSelect={(event, value) => {
        onSelect?.(event, value);
        closeOnSelect && setIsOpen(false);
      }}
      selected={selected}
      toggle={SelectToggle({
        isDisabled,
        isExpanded: isOpen,
        onClick: onToggle,
        selected: selectedLabel ?? selected ?? placeholder,
        ...toggleProps,
      })}
      {...props}
    >
      <SelectList className="FormPFSelect-list">{children}</SelectList>
    </Select>
  );
};

export default FormPFSelect;
