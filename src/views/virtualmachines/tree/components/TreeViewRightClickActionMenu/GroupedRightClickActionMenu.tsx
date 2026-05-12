import React, { FC } from 'react';

import ActionDropdownItem from '@kubevirt-utils/components/ActionDropdownItem/ActionDropdownItem';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, MenuGroup, MenuList, TooltipPosition } from '@patternfly/react-core';

import useGroupedActions from './hooks/useGroupedActions';
import { RIGHT_CLICK_MENU_Z_INDEX } from './constants';
import { RightClickActionMenuProps } from './RightClickActionMenu';
import RightClickMenuWrapper from './RightClickMenuWrapper';

type GroupedRightClickActionMenuProps = RightClickActionMenuProps & {
  createVMAction?: ActionDropdownItemType;
};

const GroupedRightClickActionMenu: FC<GroupedRightClickActionMenuProps> = ({
  actions,
  createVMAction,
  hideMenu,
  nestedLevel,
  triggerRef,
}) => {
  const { t } = useKubevirtTranslation();
  const { bottomActions, manageVMsActions } = useGroupedActions(actions);

  return (
    <RightClickMenuWrapper nestedLevel={nestedLevel} triggerRef={triggerRef}>
      {createVMAction && (
        <>
          <MenuGroup>
            <MenuList>
              <ActionDropdownItem
                action={createVMAction}
                key={createVMAction.id}
                setIsOpen={hideMenu}
                tooltipPosition={TooltipPosition.right}
                tooltipZIndex={RIGHT_CLICK_MENU_Z_INDEX + 1}
              />
            </MenuList>
          </MenuGroup>
          <Divider />
        </>
      )}
      <MenuGroup label={t('Manage all VMs')}>
        <MenuList>
          {manageVMsActions.map((action) => (
            <ActionDropdownItem
              action={action}
              key={action.id}
              setIsOpen={hideMenu}
              tooltipPosition={TooltipPosition.right}
              tooltipZIndex={RIGHT_CLICK_MENU_Z_INDEX + 1}
            />
          ))}
        </MenuList>
      </MenuGroup>
      <Divider />
      <MenuGroup>
        <MenuList>
          {bottomActions.map((action) => (
            <ActionDropdownItem
              action={action}
              key={action.id}
              setIsOpen={hideMenu}
              tooltipPosition={TooltipPosition.right}
              tooltipZIndex={RIGHT_CLICK_MENU_Z_INDEX + 1}
            />
          ))}
        </MenuList>
      </MenuGroup>
    </RightClickMenuWrapper>
  );
};

export default GroupedRightClickActionMenu;
