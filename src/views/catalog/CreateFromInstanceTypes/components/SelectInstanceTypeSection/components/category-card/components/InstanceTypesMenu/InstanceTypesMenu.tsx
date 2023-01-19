import React from 'react';

import { Menu, MenuContent, MenuItem, MenuList } from '@patternfly/react-core';

import { CategoryCustomData } from '../../../../utils/types';
import { seriesDetails } from '../../../../utils/utils';

import './InstanceTypesMenu.scss';

type InstanceTypesMenuProps = {
  menuRef: React.RefObject<HTMLDivElement>;
  customData: CategoryCustomData;
  onClick: (...args: any[]) => void;
  onSelect: (...args: any[]) => void;
};

const InstanceTypesMenu: React.FC<InstanceTypesMenuProps> = ({
  menuRef,
  customData,
  onClick,
  onSelect,
}) => {
  const { category, selectedSize } = customData;
  const { instanceTypes } = seriesDetails[category];

  const handleSelect = (e, selectedItem) => {
    onSelect(category, selectedItem);
    onClick();
  };

  return (
    <Menu
      ref={menuRef}
      activeItemId={selectedSize}
      onSelect={handleSelect}
      className="instance-types-menu"
    >
      <MenuContent>
        <MenuList>
          {instanceTypes?.map((instanceType) => {
            const { cores, name, memory } = instanceType;
            return (
              <MenuItem
                key={name}
                itemId={name}
              >{`${name}: ${cores} Cores, ${memory} Memory`}</MenuItem>
            );
          })}
        </MenuList>
      </MenuContent>
    </Menu>
  );
};

export default InstanceTypesMenu;
