import React, {
  Dispatch,
  FC,
  KeyboardEvent,
  ReactNode,
  SetStateAction,
  useRef,
  useState,
} from 'react';

import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import {
  Menu,
  MenuContent,
  MenuList,
  MenuToggle,
  Popper,
  PopperProps,
} from '@patternfly/react-core';

type MenuHeightsType = {
  [id: string]: number;
};

type ComposableDrilldownMenuProps = {
  id?: string;
  isOpen: boolean;
  isScrollable?: boolean;
  scrollableMenuIDs?: string[];
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  toggleLabel?: ReactNode;
  trigger?: ReactNode;
} & Pick<PopperProps, 'appendTo' | 'direction' | 'triggerRef'>;

const ComposableDrilldownSelect: FC<ComposableDrilldownMenuProps> = ({
  appendTo,
  children,
  direction,
  id = 'rootMenu',
  isOpen,
  isScrollable = false,
  scrollableMenuIDs = [],
  setIsOpen,
  toggleLabel,
  trigger,
  triggerRef,
}) => {
  const [activeMenu, setActiveMenu] = useState<string>(id);
  const [menuDrilledIn, setMenuDrilledIn] = useState<string[]>([]);
  const [drilldownPath, setDrilldownPath] = useState<string[]>([]);
  const [menuHeights, setMenuHeights] = useState<MenuHeightsType>({});
  const menuRef = useRef<HTMLDivElement>(null);

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
    if (menuHeights[menuId] === undefined || (menuId !== id && menuHeights[menuId] !== height)) {
      setMenuHeights((prev) => ({
        ...prev,
        [menuId]: height,
      }));
    }
  };

  useClickOutside([menuRef], onToggleClick);

  return (
    <Popper
      popper={
        <Menu
          activeMenu={activeMenu}
          containsDrilldown
          drilldownItemPath={drilldownPath}
          drilledInMenus={menuDrilledIn}
          id={id}
          isScrollable={isScrollable || scrollableMenuIDs.includes(activeMenu)}
          onDrillIn={drillIn}
          onDrillOut={drillOut}
          onGetMenuHeight={setHeight}
          ref={menuRef}
        >
          <MenuContent menuHeight={`${menuHeights[activeMenu]}px`}>
            <MenuList>{children}</MenuList>
          </MenuContent>
        </Menu>
      }
      trigger={
        trigger ?? (
          <MenuToggle isExpanded={isOpen} isFullWidth onClick={onToggleClick}>
            {toggleLabel}
          </MenuToggle>
        )
      }
      appendTo={appendTo}
      direction={direction}
      isVisible={isOpen}
      triggerRef={triggerRef}
    />
  );
};

export default ComposableDrilldownSelect;
