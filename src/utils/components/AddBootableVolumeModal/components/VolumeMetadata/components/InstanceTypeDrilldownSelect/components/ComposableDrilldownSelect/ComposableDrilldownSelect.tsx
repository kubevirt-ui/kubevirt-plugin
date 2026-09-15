import {
  type Dispatch,
  type FC,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type SetStateAction,
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
  type PopperProps,
} from '@patternfly/react-core';

type MenuHeightsType = {
  [id: string]: number;
};

type ComposableDrilldownMenuProps = {
  children?: ReactNode;
  id?: string;
  isDisabled?: boolean;
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
  isDisabled,
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

  const onToggleClick = (event?: MouseEvent): void => {
    if (isDisabled) {
      return;
    }
    event?.stopPropagation(); // Stop handleClickOutside from handling
    setIsOpen(!isOpen);
    setMenuDrilledIn([]);
    setDrilldownPath([]);
    setActiveMenu(id);
  };

  const drillIn = (
    _event: KeyboardEvent | MouseEvent,
    fromMenuId: string,
    toMenuId: string,
    pathId: string,
  ): void => {
    setMenuDrilledIn([...menuDrilledIn, fromMenuId]);
    setDrilldownPath([...drilldownPath, pathId]);
    setActiveMenu(toMenuId);
  };

  const drillOut = (_event: KeyboardEvent | MouseEvent, toMenuId: string): void => {
    setMenuDrilledIn(menuDrilledIn.slice(0, menuDrilledIn.length - 1));
    setDrilldownPath(drilldownPath.slice(0, drilldownPath.length - 1));
    setActiveMenu(toMenuId);
  };

  const setHeight = (menuId: string, height: number): void => {
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
      appendTo={appendTo}
      direction={direction}
      isVisible={isOpen}
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
          <MenuToggle
            isDisabled={isDisabled}
            isExpanded={isOpen}
            isFullWidth
            onClick={onToggleClick}
          >
            {toggleLabel}
          </MenuToggle>
        )
      }
      triggerRef={triggerRef}
    />
  );
};

export default ComposableDrilldownSelect;
