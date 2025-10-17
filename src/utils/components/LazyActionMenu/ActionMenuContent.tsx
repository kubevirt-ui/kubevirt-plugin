/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';

import {
  Action,
  GroupedMenuOption,
  MenuOption,
  MenuOptionType,
} from '@openshift-console/dynamic-plugin-sdk';
import { Divider, Menu, MenuContent, MenuGroup, MenuItem, MenuList } from '@patternfly/react-core';

import ActionMenuItem from './ActionMenuItem';
import { orderExtensionBasedOnInsertBeforeAndAfter } from './order-extensions';
import { getMenuOptionType } from './utils';

type GroupMenuContentProps = {
  onClick: () => void;
  option: GroupedMenuOption;
};

const GroupMenuContent: React.FC<GroupMenuContentProps> = ({ onClick, option }) => (
  <>
    <Divider />
    <MenuGroup label={option.label}>
      <MenuList>
        <ActionMenuContent
          focusItem={option.children[0]}
          onClick={onClick}
          options={option.children}
        />
      </MenuList>
    </MenuGroup>
  </>
);

// Need to keep this in the same file to avoid circular dependency.
const SubMenuContent: React.FC<GroupMenuContentProps> = ({ onClick, option }) => (
  <MenuItem
    flyoutMenu={
      <Menu containsFlyout>
        <MenuContent data-test-id="action-items">
          <MenuList>
            <ActionMenuContent
              focusItem={option.children[0]}
              onClick={onClick}
              options={option.children}
            />
          </MenuList>
        </MenuContent>
      </Menu>
    }
    data-test-action={option.id}
  >
    {option.label}
  </MenuItem>
);

type ActionMenuContentProps = {
  focusItem?: MenuOption;
  isMulticluster?: boolean;
  onClick: () => void;
  options: MenuOption[];
};

const ActionMenuContent: React.FC<ActionMenuContentProps> = ({
  focusItem,
  isMulticluster,
  onClick,
  options,
}) => {
  const sortedOptions = orderExtensionBasedOnInsertBeforeAndAfter(options);
  return (
    <>
      {sortedOptions.map((option) => {
        const optionType = getMenuOptionType(option);
        switch (optionType) {
          case MenuOptionType.SUB_MENU:
            return (
              <SubMenuContent
                key={option.id}
                onClick={onClick}
                option={option as GroupedMenuOption}
              />
            );
          case MenuOptionType.GROUP_MENU:
            return (
              <GroupMenuContent
                key={option.id}
                onClick={onClick}
                option={option as GroupedMenuOption}
              />
            );
          default:
            return (
              <ActionMenuItem
                action={option as Action}
                autoFocus={focusItem ? option === focusItem : undefined}
                isMulticluster={isMulticluster}
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
