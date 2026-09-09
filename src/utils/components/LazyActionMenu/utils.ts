import {
  type GroupedMenuOption,
  type MenuOption,
  MenuOptionType,
} from '@openshift-console/dynamic-plugin-sdk';

const isGroupedMenuOption = (option: MenuOption): option is GroupedMenuOption =>
  'children' in option && Array.isArray(option.children);

export const getMenuOptionType = (option: MenuOption): MenuOptionType => {
  // a grouped menu has children
  const isGroupMenu = isGroupedMenuOption(option);
  // a submenu menu has children and submenu property true
  const isSubMenu = isGroupMenu && option.submenu;

  if (isSubMenu) {
    return MenuOptionType.SUB_MENU;
  }

  if (isGroupMenu) {
    return MenuOptionType.GROUP_MENU;
  }

  return MenuOptionType.ATOMIC_MENU;
};
