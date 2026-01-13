import React, { FC, MouseEvent as ReactMouseEvent, ReactNode, Ref, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Label,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import './MultiSelect.scss';

export type MultiSelectOption = { content: ReactNode; id: string };

type MultiSelectProps = {
  items: MultiSelectOption[];
  selectedItems: string[];
  setSelectedItems: (items: any[]) => void;
  toggleText?: string;
};

const MultiSelect: FC<MultiSelectProps> = ({
  items,
  selectedItems,
  setSelectedItems,
  toggleText,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: ReactMouseEvent<Element, MouseEvent> | undefined, value: string) => {
    if (selectedItems.includes(value)) {
      setSelectedItems(selectedItems.filter((id) => id !== value));
    } else {
      setSelectedItems([...selectedItems, value]);
    }
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      className="multi-select-toggle"
      isExpanded={isOpen}
      onClick={onToggleClick}
      ref={toggleRef}
    >
      {toggleText || t('Select items')}
      {selectedItems.length > 0 && (
        <Label className="pf-v6-u-ml-sm">
          {selectedItems?.length === items?.length ? t('All') : selectedItems.length}
        </Label>
      )}
    </MenuToggle>
  );

  return (
    <Select
      id="multi-select"
      isOpen={isOpen}
      onOpenChange={(nextOpen: boolean) => setIsOpen(nextOpen)}
      onSelect={onSelect}
      role="menu"
      selected={selectedItems}
      toggle={toggle}
    >
      <SelectList>
        {items?.map((option) => (
          <SelectOption
            hasCheckbox
            isSelected={selectedItems.includes(option.id)}
            key={option.id}
            value={option.id}
          >
            {option.content}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export default MultiSelect;
