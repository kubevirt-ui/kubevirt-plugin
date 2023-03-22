import React from 'react';

import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { Menu, MenuContent, MenuItem, MenuList } from '@patternfly/react-core';

import { CategoryCustomData, InstanceTypeSize } from '../../../../utils/types';
import { categoryDetailsMap } from '../../../../utils/utils';

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
  const { instanceTypes } = categoryDetailsMap[category];

  const handleSelect = (e, selectedItem: InstanceTypeSize) => {
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
            const { cpus, name, memory } = instanceType;
            return (
              <MenuItem key={name} itemId={name}>{`${name}: ${cpus} CPUs, ${readableSizeUnit(
                memory,
              )} Memory`}</MenuItem>
            );
          })}
        </MenuList>
      </MenuContent>
    </Menu>
  );
};

export default InstanceTypesMenu;
