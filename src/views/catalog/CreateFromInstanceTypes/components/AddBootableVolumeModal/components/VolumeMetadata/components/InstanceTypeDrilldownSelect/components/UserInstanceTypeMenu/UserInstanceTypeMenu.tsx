import React, { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { MenuInput, MenuItem, SearchInput } from '@patternfly/react-core';

type UserInstanceTypeMenuProps = {
  items: string[];
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
};

const UserInstanceTypeMenu: FC<UserInstanceTypeMenuProps> = ({ items, selected, setSelected }) => {
  const { t } = useKubevirtTranslation();

  const [searchInput, setSearchInput] = useState('');

  const filteredItems = useMemo(
    () =>
      items.filter(
        (opt) =>
          isEmpty(searchInput) || opt.toLowerCase().includes(searchInput.toString().toLowerCase()),
      ),
    [items, searchInput],
  );

  if (isEmpty(filteredItems)) return <MenuItem isDisabled>{t('No results found')}</MenuItem>;

  return (
    <>
      {items.length > 5 && (
        <MenuInput>
          <SearchInput
            value={searchInput}
            aria-label="Filter menu items"
            type="search"
            onChange={(_, value) => setSearchInput(value)}
          />
        </MenuInput>
      )}
      {filteredItems.map((userITName) => (
        <MenuItem
          key={userITName}
          itemId={userITName}
          onClick={() => setSelected(userITName)}
          isSelected={selected === userITName}
          icon={
            <ResourceIcon
              groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
            />
          }
        >
          {userITName}
        </MenuItem>
      ))}
    </>
  );
};
export default UserInstanceTypeMenu;
