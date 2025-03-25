import React, { FC, ReactNode, Ref, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Badge,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
  SelectProps,
} from '@patternfly/react-core';

type CheckboxSelectProps = {
  onSelect?: SelectProps['onSelect'];
  options?: SelectOptionProps[];
  selectedValues: any[];
  toggleTitle?: ReactNode;
};

const CheckboxSelect: FC<CheckboxSelectProps> = ({
  onSelect,
  options,
  selectedValues,
  toggleTitle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useKubevirtTranslation();

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle isExpanded={isOpen} onClick={onToggleClick} ref={toggleRef}>
      {toggleTitle} <Badge isRead>{selectedValues.length || t('All')}</Badge>
    </MenuToggle>
  );

  return (
    <Select
      id="checkbox-select"
      isOpen={isOpen}
      isScrollable
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      role="menu"
      selected={selectedValues}
      toggle={toggle}
    >
      <SelectList>
        {options.map((option, index) => (
          <SelectOption hasCheckbox key={index} {...option} />
        ))}
      </SelectList>
    </Select>
  );
};

export default CheckboxSelect;
