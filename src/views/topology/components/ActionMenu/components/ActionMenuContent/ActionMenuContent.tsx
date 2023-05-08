import * as React from 'react';

import {
  Action,
  GroupedMenuOption,
  MenuOption,
  MenuOptionType,
} from '@openshift-console/dynamic-plugin-sdk';
import { Divider, Menu, MenuContent, MenuGroup, MenuItem, MenuList } from '@patternfly/react-core';

import ActionMenuItem from './components/ActionMenuItem/ActionMenuItem';
import { getMenuOptionType, orderExtensionBasedOnInsertBeforeAndAfter } from './utils/utils';

type GroupMenuContentProps = {
  option: GroupedMenuOption;
  onClick: () => void;
};

// Need to keep this in the same file to avoid circular dependency.
const GroupMenuContent: React.FC<GroupMenuContentProps> = ({ option, onClick }) => (
  <>
    <Divider />
    <MenuGroup label={option.label} translate="no">
      <MenuList>
        <ActionMenuContent
          options={option.children}
          onClick={onClick}
          focusItem={option.children[0]}
        />
      </MenuList>
    </MenuGroup>
  </>
);

// Need to keep this in the same file to avoid circular dependency.
const SubMenuContent: React.FC<GroupMenuContentProps> = ({ option, onClick }) => (
  <MenuItem
    data-test-action={option.id}
    flyoutMenu={
      <Menu containsFlyout>
        <MenuContent data-test-id="action-items" translate="no">
          <MenuList>
            <ActionMenuContent
              options={option.children}
              onClick={onClick}
              focusItem={option.children[0]}
            />
          </MenuList>
        </MenuContent>
      </Menu>
    }
    translate="no"
  >
    {option.label}
  </MenuItem>
);

type ActionMenuContentProps = {
  options: MenuOption[];
  onClick: () => void;
  focusItem?: MenuOption;
};

const ActionMenuContent: React.FC<ActionMenuContentProps> = ({ options, onClick, focusItem }) => {
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
                option={option as GroupedMenuOption}
                onClick={onClick}
              />
            );
          case MenuOptionType.GROUP_MENU:
            return (
              <GroupMenuContent
                key={option.id}
                option={option as GroupedMenuOption}
                onClick={onClick}
              />
            );
          default:
            return (
              <ActionMenuItem
                key={option.id}
                action={option as Action}
                onClick={onClick}
                autoFocus={focusItem ? option === focusItem : undefined}
              />
            );
        }
      })}
    </>
  );
};

export default ActionMenuContent;
