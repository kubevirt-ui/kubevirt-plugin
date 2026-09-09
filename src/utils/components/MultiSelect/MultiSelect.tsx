import React, {
  type FC,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  useState,
} from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Label,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import './MultiSelect.scss';

export type MultiSelectOption = { content: ReactNode; id: string };

type MultiSelectProps = {
  dataTestId?: string;
  items: MultiSelectOption[];
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  toggleText?: string;
};

const MultiSelect: FC<MultiSelectProps> = ({
  dataTestId,
  items,
  selectedItems,
  setSelectedItems,
  toggleText,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = (): void => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: ReactMouseEvent<Element, MouseEvent> | undefined,
    value: string,
  ): void => {
    if (selectedItems.includes(value)) {
      setSelectedItems(selectedItems.filter((id) => id !== value));
    } else {
      setSelectedItems([...selectedItems, value]);
    }
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>): ReactElement => (
    <MenuToggle
      className="multi-select-toggle"
      data-test={dataTestId}
      isExpanded={isOpen}
      onClick={onToggleClick}
      ref={toggleRef}
    >
      {toggleText ?? t('Select items')}
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
