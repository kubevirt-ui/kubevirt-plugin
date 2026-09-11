import { type Dispatch, type FC, type SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoPermissionTooltipContent } from '@kubevirt-utils/utils/utils';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

import { type ActionDropdownItemType } from '../ActionsDropdown/constants';

import './ActionDropdownItem.scss';

type ActionDropdownItemProps = {
  action: ActionDropdownItemType;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  tooltipPosition?: TooltipPosition;
  tooltipZIndex?: number;
};

const ActionDropdownItem: FC<ActionDropdownItemProps> = ({
  action,
  setIsOpen,
  tooltipPosition,
  tooltipZIndex,
}) => {
  const { t } = useKubevirtTranslation();
  const [accessReview, loading] = useFleetAccessReview(action?.accessReview ?? {});

  const actionAllowed = accessReview || action?.accessReview === undefined;
  const isDisabled = !actionAllowed || action?.disabled;
  const isPermissionDenied = action?.accessReview != null && !loading && !accessReview;
  const tooltipContent = isPermissionDenied
    ? getNoPermissionTooltipContent(t)
    : action?.disabledTooltip;
  const showTooltip = isDisabled && tooltipContent;

  const handleClick = (): void => {
    if (typeof action?.cta === 'function') {
      action?.cta();
      setIsOpen(false);
    }
  };

  const menuItem = (
    <MenuItem
      data-test={`${action?.id}`}
      description={action?.description}
      flyoutMenu={
        action?.options && (
          <Menu className="kv-actions-dropdown-submenu" containsFlyout id={`menu-${action.id}`}>
            <MenuContent>
              <MenuList>
                {action?.options?.map((option) => (
                  <ActionDropdownItem
                    action={option}
                    key={option.id}
                    setIsOpen={setIsOpen}
                    tooltipPosition={tooltipPosition}
                    tooltipZIndex={tooltipZIndex}
                  />
                ))}
              </MenuList>
            </MenuContent>
          </Menu>
        )
      }
      isAriaDisabled={isDisabled}
      key={action?.id}
      onClick={handleClick}
    >
      {action?.label}
      {action?.icon && (
        <>
          {' '}
          <span className="pf-v6-u-text-color-subtle">{action.icon}</span>
        </>
      )}
    </MenuItem>
  );

  if (showTooltip) {
    return (
      <Tooltip
        content={tooltipContent}
        position={tooltipPosition ?? TooltipPosition.left}
        {...(tooltipZIndex && { zIndex: tooltipZIndex })}
      >
        <div>{menuItem}</div>
      </Tooltip>
    );
  }

  return menuItem;
};

export default ActionDropdownItem;
