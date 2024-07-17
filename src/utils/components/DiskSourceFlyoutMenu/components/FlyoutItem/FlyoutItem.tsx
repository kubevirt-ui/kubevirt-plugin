import React, { FC } from 'react';

import { DiskSourceOptionGroupItem } from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/utils/types';
import { Menu, MenuContent, MenuItem, MenuList } from '@patternfly/react-core';

import { DiskSourceFlyoutMenuProps } from '../../utils/types';

import './FlyoutItem.scss';

type FlyoutItemProps = {
  items: DiskSourceOptionGroupItem[];
  onSelect: DiskSourceFlyoutMenuProps['onSelect'];
};
const FlyoutItem: FC<FlyoutItemProps> = ({ items, onSelect }) => (
  <Menu className="flyout-item">
    <MenuContent>
      <MenuList>
        {items?.map(({ description, id, label }) => (
          <MenuItem description={description} itemId={id} key={id} onClick={() => onSelect(id)}>
            {label}
          </MenuItem>
        ))}
      </MenuList>
    </MenuContent>
  </Menu>
);

export default FlyoutItem;
