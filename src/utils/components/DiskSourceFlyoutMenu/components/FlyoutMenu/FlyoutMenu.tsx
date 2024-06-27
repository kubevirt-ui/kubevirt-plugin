import React, { forwardRef } from 'react';

import { DiskSourceOptionGroup } from '@kubevirt-utils/components/DiskModal/components/DiskSourceSelect/utils/types';
import { SourceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { Menu, MenuContent, MenuItem, MenuList } from '@patternfly/react-core';

import FlyoutItem from '../FlyoutItem/FlyoutItem';

type FlyoutMenuProps = {
  onSelectSource: (value: SourceTypes) => void;
  options: DiskSourceOptionGroup[];
};

const FlyoutMenu = forwardRef<HTMLDivElement, FlyoutMenuProps>(
  ({ onSelectSource, options }, ref) => (
    <Menu containsFlyout ref={ref}>
      <MenuContent>
        <MenuList>
          {options?.map(({ description, groupLabel, items }) => {
            const isFlyout = items?.length > 1;
            return isFlyout ? (
              <MenuItem
                description={description}
                flyoutMenu={<FlyoutItem items={items} onSelect={onSelectSource} />}
                itemId={groupLabel}
              >
                {groupLabel}
              </MenuItem>
            ) : (
              <MenuItem
                description={description}
                itemId={items?.[0]?.id}
                onClick={() => onSelectSource(items?.[0]?.id)}
              >
                {items?.[0]?.label}
              </MenuItem>
            );
          })}
        </MenuList>
      </MenuContent>
    </Menu>
  ),
);

export default FlyoutMenu;
