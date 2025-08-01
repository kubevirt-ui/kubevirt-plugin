import React, { FC, ReactNode, Ref, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
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
  showAllBadge?: boolean;
  toggleTitle?: ReactNode;
};

const CheckboxSelect: FC<CheckboxSelectProps> = ({
  onSelect,
  options,
  selectedValues,
  showAllBadge,
  toggleTitle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useKubevirtTranslation();

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const hasSelectedValues = !isEmpty(selectedValues);

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      badge={
        showAllBadge || hasSelectedValues ? (
          <Badge isRead>{selectedValues.length || t('All')}</Badge>
        ) : null
      }
      isExpanded={isOpen}
      onClick={onToggleClick}
      ref={toggleRef}
    >
      {toggleTitle}
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
        {isEmpty(options) && <SelectOption isDisabled>{t('No options found')}</SelectOption>}
      </SelectList>
    </Select>
  );
};

export default CheckboxSelect;
