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
            aria-label="Filter menu items"
            onChange={(_, value) => setSearchInput(value)}
            type="search"
            value={searchInput}
          />
        </MenuInput>
      )}
      {filteredItems.map((userITName) => (
        <MenuItem
          icon={
            <ResourceIcon
              groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
            />
          }
          isSelected={selected === userITName}
          itemId={userITName}
          key={userITName}
          onClick={() => setSelected(userITName)}
        >
          {userITName}
        </MenuItem>
      ))}
    </>
  );
};
export default UserInstanceTypeMenu;
