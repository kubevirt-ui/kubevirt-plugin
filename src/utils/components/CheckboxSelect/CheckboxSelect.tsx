import React, { FC, ReactNode, useState } from 'react';

import ToolbarFilterToggle from '@kubevirt-utils/components/toggles/ToolbarFilterToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  MenuToggleProps,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
  SelectProps,
} from '@patternfly/react-core';

type CheckboxSelectProps = {
  badgeNumber?: number;
  dataTestId?: string;
  isToggleDisabled?: boolean;
  onSelect?: SelectProps['onSelect'];
  options?: SelectOptionProps[];
  selectedValues: any[];
  showAllBadge?: boolean;
  toggleSize?: MenuToggleProps['size'];
  toggleTitle?: ReactNode;
  tooltipContent?: ReactNode;
};

const CheckboxSelect: FC<CheckboxSelectProps> = ({
  badgeNumber,
  dataTestId,
  isToggleDisabled = false,
  onSelect,
  options,
  selectedValues,
  showAllBadge,
  toggleSize,
  toggleTitle,
  tooltipContent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useKubevirtTranslation();

  const toggle = ToolbarFilterToggle({
    badgeNumber,
    'data-test': dataTestId,
    isDisabled: isToggleDisabled,
    isExpanded: isOpen,
    onClick: () => setIsOpen((prev) => !prev),
    selectedValues,
    showAllBadge,
    size: toggleSize,
    title: toggleTitle,
    tooltipContent,
  });

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
        {options?.map((option, index) => (
          <SelectOption hasCheckbox key={index} {...option} />
        ))}
        {isEmpty(options) && <SelectOption isDisabled>{t('No options found')}</SelectOption>}
      </SelectList>
    </Select>
  );
};

export default CheckboxSelect;
