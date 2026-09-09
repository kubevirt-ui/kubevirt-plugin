import React, { type ReactElement, type ReactNode, type Ref } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Badge,
  MenuToggle,
  type MenuToggleElement,
  type MenuToggleProps,
  Tooltip,
} from '@patternfly/react-core';

type ToolbarFilterToggleProps = {
  badgeNumber?: number;
  'data-test'?: string;
  isDisabled?: boolean;
  isExpanded: boolean;
  onClick: () => void;
  selectedValues: unknown[];
  showAllBadge?: boolean;
  size?: MenuToggleProps['size'];
  title?: ReactNode;
  tooltipContent?: ReactNode;
};

const ToolbarFilterToggle = ({
  badgeNumber,
  'data-test': dataTestId,
  isDisabled = false,
  isExpanded,
  onClick,
  selectedValues,
  showAllBadge,
  size,
  title,
  tooltipContent,
}: ToolbarFilterToggleProps) => {
  const { t } = useKubevirtTranslation();
  const hasSelectedValues = !isEmpty(selectedValues);

  return (toggleRef: Ref<MenuToggleElement>): ReactElement => {
    const menuToggle = (
      <MenuToggle
        badge={
          badgeNumber || hasSelectedValues || showAllBadge ? (
            <Badge isRead>
              {badgeNumber ?? (selectedValues.length > 0 ? selectedValues.length : t('All'))}
            </Badge>
          ) : null
        }
        data-test={dataTestId}
        isDisabled={isDisabled}
        isExpanded={isExpanded}
        onClick={onClick}
        ref={toggleRef}
        size={size}
      >
        {title}
      </MenuToggle>
    );

    if (isDisabled && tooltipContent) {
      return (
        <Tooltip content={tooltipContent}>
          <div>{menuToggle}</div>
        </Tooltip>
      );
    }

    return menuToggle;
  };
};

export default ToolbarFilterToggle;
