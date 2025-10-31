import {
  GroupedMenuOption,
  MenuOption,
  MenuOptionType,
} from '@openshift-console/dynamic-plugin-sdk';

export const getMenuOptionType = (option: MenuOption) => {
  // a grouped menu has children
  const isGroupMenu = Array.isArray((option as GroupedMenuOption).children);
  // a submenu menu has children and submenu property true
  const isSubMenu = isGroupMenu && (option as GroupedMenuOption).submenu;

  if (isSubMenu) {
    return MenuOptionType.SUB_MENU;
  }

  if (isGroupMenu) {
    return MenuOptionType.GROUP_MENU;
  }

  return MenuOptionType.ATOMIC_MENU;
};
