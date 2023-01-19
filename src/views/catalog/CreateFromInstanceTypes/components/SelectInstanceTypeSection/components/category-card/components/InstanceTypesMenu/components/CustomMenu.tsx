import React, { ElementType, useRef, useState } from 'react';

import InstanceTypesMenu from '../InstanceTypesMenu';

import CustomMenuRenderer from './CustomMenuRenderer';
import EnhancedMenuToggle from './EnhancedMenuToggle';

type CustomMenuProps = {
  toggleComponent: ElementType;
  onSelect: (...args: any[]) => void;
  customData?: any;
};

const CustomMenu: React.FC<CustomMenuProps> = (props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hideMenu = () => {
    setIsOpen(false);
  };

  return (
    <div ref={containerRef}>
      <EnhancedMenuToggle
        isOpen={isOpen}
        toggleRef={toggleRef}
        menuRef={menuRef}
        onToggleClick={setIsOpen}
        {...props}
      />
      <CustomMenuRenderer
        isOpen={isOpen}
        containerRef={containerRef}
        menuRef={menuRef}
        toggleRef={toggleRef}
        onClick={hideMenu}
        MenuComponent={InstanceTypesMenu}
        {...props}
      />
    </div>
  );
};

export default CustomMenu;
