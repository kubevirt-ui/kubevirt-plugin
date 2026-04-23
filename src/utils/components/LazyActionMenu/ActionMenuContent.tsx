import React, { FC } from 'react';

import {
  Action,
  GroupedMenuOption,
  MenuOption,
  MenuOptionType,
} from '@openshift-console/dynamic-plugin-sdk';
import { Divider, Menu, MenuContent, MenuGroup, MenuItem, MenuList } from '@patternfly/react-core';

import ActionMenuItem from './ActionMenuItem';
import { CheckAccess } from './LazyActionMenu';
import { orderExtensionBasedOnInsertBeforeAndAfter } from './order-extensions';
import { getMenuOptionType } from './utils';

type GroupMenuContentProps = {
  onClick: () => void;
  option: GroupedMenuOption;
};

const GroupMenuContent: FC<GroupMenuContentProps & { checkAccess: CheckAccess }> = ({
  checkAccess,
  onClick,
  option,
}) => (
  <>
    <Divider />
    <MenuGroup label={option.label}>
      <MenuList>
        <ActionMenuContent checkAccess={checkAccess} onClick={onClick} options={option.children} />
      </MenuList>
    </MenuGroup>
  </>
);

// Need to keep this in the same file to avoid circular dependency.
const SubMenuContent: FC<GroupMenuContentProps & { checkAccess: CheckAccess }> = ({
  checkAccess,
  onClick,
  option,
}) => (
  <MenuItem
    flyoutMenu={
      <Menu containsFlyout>
        <MenuContent data-test-id="action-items">
          <MenuList>
            <ActionMenuContent
              checkAccess={checkAccess}
              onClick={onClick}
              options={option.children}
            />
          </MenuList>
        </MenuContent>
      </Menu>
    }
    data-test-id={option.id}
  >
    {option.label}
  </MenuItem>
);

type ActionMenuContentProps = {
  checkAccess: CheckAccess;
  focusItem?: MenuOption;
  onClick: () => void;
  options: MenuOption[];
};

const ActionMenuContent: FC<ActionMenuContentProps> = ({ checkAccess, onClick, options }) => {
  const sortedOptions = orderExtensionBasedOnInsertBeforeAndAfter(options);
  return (
    <>
      {sortedOptions.map((option) => {
        const optionType = getMenuOptionType(option);
        switch (optionType) {
          case MenuOptionType.SUB_MENU:
            return (
              <SubMenuContent
                checkAccess={checkAccess}
                key={option.id}
                onClick={onClick}
                option={option as GroupedMenuOption}
              />
            );
          case MenuOptionType.GROUP_MENU:
            return (
              <GroupMenuContent
                checkAccess={checkAccess}
                key={option.id}
                onClick={onClick}
                option={option as GroupedMenuOption}
              />
            );
          default:
            return (
              <ActionMenuItem
                action={option as Action}
                checkAccess={checkAccess}
                key={option.id}
                onClick={onClick}
              />
            );
        }
      })}
    </>
  );
};

export default ActionMenuContent;
