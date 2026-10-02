import type { FC } from 'react';

import type { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, MenuGroup, MenuList } from '@patternfly/react-core';

import RightClickActionMenuItem from './components/RightClickActionMenuItem';
import useGroupedActions from './hooks/useGroupedActions';
import type { RightClickActionMenuProps } from './RightClickActionMenu';
import RightClickMenuWrapper from './RightClickMenuWrapper';

type GroupedRightClickActionMenuProps = RightClickActionMenuProps & {
  createVMAction?: ActionDropdownItemType;
  deleteProjectAction?: ActionDropdownItemType;
};

const GroupedRightClickActionMenu: FC<GroupedRightClickActionMenuProps> = ({
  actions,
  createVMAction,
  deleteProjectAction,
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
              <RightClickActionMenuItem action={createVMAction} hideMenu={hideMenu} />
            </MenuList>
          </MenuGroup>
          <Divider />
        </>
      )}
      <MenuGroup label={t('Manage all VMs')}>
        <MenuList>
          {manageVMsActions.map((action) => (
            <RightClickActionMenuItem action={action} hideMenu={hideMenu} key={action.id} />
          ))}
        </MenuList>
      </MenuGroup>
      <Divider />
      <MenuGroup>
        <MenuList>
          {bottomActions.map((action) => (
            <RightClickActionMenuItem action={action} hideMenu={hideMenu} key={action.id} />
          ))}
        </MenuList>
      </MenuGroup>
      {deleteProjectAction && (
        <>
          <Divider />
          <MenuGroup>
            <MenuList>
              <RightClickActionMenuItem action={deleteProjectAction} hideMenu={hideMenu} />
            </MenuList>
          </MenuGroup>
        </>
      )}
    </RightClickMenuWrapper>
  );
};

export default GroupedRightClickActionMenu;
