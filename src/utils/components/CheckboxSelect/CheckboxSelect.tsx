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
  Tooltip,
} from '@patternfly/react-core';

type CheckboxSelectProps = {
  badgeNumber?: number;
  isToggleDisabled?: boolean;
  onSelect?: SelectProps['onSelect'];
  options?: SelectOptionProps[];
  selectedValues: any[];
  showAllBadge?: boolean;
  toggleTitle?: ReactNode;
  tooltipContent?: ReactNode;
};

const CheckboxSelect: FC<CheckboxSelectProps> = ({
  badgeNumber,
  isToggleDisabled = false,
  onSelect,
  options,
  selectedValues,
  showAllBadge,
  toggleTitle,
  tooltipContent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useKubevirtTranslation();

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const hasSelectedValues = !isEmpty(selectedValues);

  const toggle = (toggleRef: Ref<MenuToggleElement>) => {
    const menuToggle = (
      <MenuToggle
        badge={
          badgeNumber || hasSelectedValues || showAllBadge ? (
            <Badge isRead>{badgeNumber || selectedValues.length || t('All')}</Badge>
          ) : null
        }
        isDisabled={isToggleDisabled}
        isExpanded={isOpen}
        onClick={onToggleClick}
        ref={toggleRef}
      >
        {toggleTitle}
      </MenuToggle>
    );

    if (isToggleDisabled && tooltipContent) {
      return (
        <Tooltip content={tooltipContent}>
          <div>{menuToggle}</div>
        </Tooltip>
      );
    }

    return menuToggle;
  };

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
