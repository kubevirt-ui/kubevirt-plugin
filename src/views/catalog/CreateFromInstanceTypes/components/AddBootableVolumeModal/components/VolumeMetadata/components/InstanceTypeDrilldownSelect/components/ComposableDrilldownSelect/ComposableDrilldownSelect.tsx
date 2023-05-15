import React, {
  Dispatch,
  FC,
  KeyboardEvent,
  ReactNode,
  SetStateAction,
  useRef,
  useState,
} from 'react';

import { Menu, MenuContent, MenuList, MenuToggle, Popper } from '@patternfly/react-core';

import { useClickOutside } from './hooks/useClickOutside';

type MenuHeightsType = {
  [id: string]: number;
};

type ComposableDrilldownMenuProps = {
  toggleLabel: ReactNode | string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  scrollableMenuIDs?: string[];
  isScrollable?: boolean;
  id?: string;
};

const ComposableDrilldownSelect: FC<ComposableDrilldownMenuProps> = ({
  children,
  toggleLabel,
  isOpen,
  setIsOpen,
  scrollableMenuIDs = [],
  isScrollable = false,
  id = 'rootMenu',
}) => {
  const [activeMenu, setActiveMenu] = useState<string>(id);
  const [menuDrilledIn, setMenuDrilledIn] = useState<string[]>([]);
  const [drilldownPath, setDrilldownPath] = useState<string[]>([]);
  const [menuHeights, setMenuHeights] = useState<MenuHeightsType>({});
  const ref = useRef<HTMLDivElement>(null);

  const onToggleClick = (ev?: React.MouseEvent) => {
    ev?.stopPropagation(); // Stop handleClickOutside from handling
    setIsOpen(!isOpen);
    setMenuDrilledIn([]);
    setDrilldownPath([]);
    setActiveMenu(id);
  };

  const drillIn = (
    _event: KeyboardEvent | React.MouseEvent,
    fromMenuId: string,
    toMenuId: string,
    pathId: string,
  ) => {
    setMenuDrilledIn([...menuDrilledIn, fromMenuId]);
    setDrilldownPath([...drilldownPath, pathId]);
    setActiveMenu(toMenuId);
  };

  const drillOut = (_event: KeyboardEvent | React.MouseEvent, toMenuId: string) => {
    setMenuDrilledIn(menuDrilledIn.slice(0, menuDrilledIn.length - 1));
    setDrilldownPath(drilldownPath.slice(0, drilldownPath.length - 1));
    setActiveMenu(toMenuId);
  };

  const setHeight = (menuId: string, height: number) => {
    if (!menuHeights[menuId] || (menuId !== id && menuHeights[menuId] !== height)) {
      setMenuHeights((prev) => ({
        ...prev,
        [menuId]: height,
      }));
    }
  };

  useClickOutside(ref, onToggleClick);

  return (
    <Popper
      trigger={
        <MenuToggle isFullWidth onClick={onToggleClick} isExpanded={isOpen}>
          {toggleLabel}
        </MenuToggle>
      }
      popper={
        <Menu
          id={id}
          ref={ref}
          containsDrilldown
          drilldownItemPath={drilldownPath}
          drilledInMenus={menuDrilledIn}
          activeMenu={activeMenu}
          onDrillIn={drillIn}
          onDrillOut={drillOut}
          onGetMenuHeight={setHeight}
          isScrollable={isScrollable || scrollableMenuIDs.includes(activeMenu)}
        >
          <MenuContent menuHeight={`${menuHeights[activeMenu]}px`}>
            <MenuList>{children}</MenuList>
          </MenuContent>
        </Menu>
      }
      appendTo={document.getElementById('tab-modal')}
      isVisible={isOpen}
      direction="up"
      popperMatchesTriggerWidth
    />
  );
};

export default ComposableDrilldownSelect;
