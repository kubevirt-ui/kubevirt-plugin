import React, { FC, useRef, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Menu,
  MenuContainer,
  MenuContent,
  MenuItem,
  MenuList,
  MenuToggle,
} from '@patternfly/react-core';

import { getDiskSourceOptionGroups } from '../DiskModal/components/DiskSourceSelect/utils/utils';
import { SourceTypes } from '../DiskModal/utils/types';

import FlyoutItem from './components/FlyoutItem/FlyoutItem';
import { DiskSourceFlyoutMenuProps } from './utils/types';

const DiskSourceFlyoutMenu: FC<DiskSourceFlyoutMenuProps> = ({
  className,
  isTemplate = false,
  onSelect,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const options = getDiskSourceOptionGroups(isTemplate);

  const onSelectSource = (value: SourceTypes) => {
    onSelect(value);
    setIsOpen(false);
  };

  const toggle = (
    <MenuToggle
      className={className}
      isExpanded={isOpen}
      onClick={() => setIsOpen((open) => !open)}
      ref={toggleRef}
      variant="primary"
    >
      {t('Add disk')}
    </MenuToggle>
  );

  const menu = (
    <Menu containsFlyout ref={menuRef}>
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
  );

  return (
    <MenuContainer
      isOpen={isOpen}
      menu={menu}
      menuRef={menuRef}
      onOpenChange={(open) => setIsOpen(open)}
      popperProps={{ width: '250px' }}
      toggle={toggle}
      toggleRef={toggleRef}
    />
  );
};

export default DiskSourceFlyoutMenu;
