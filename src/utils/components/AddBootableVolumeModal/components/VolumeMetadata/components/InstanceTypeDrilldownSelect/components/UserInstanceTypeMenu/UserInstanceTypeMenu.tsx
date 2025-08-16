import React, { FC, useMemo, useState } from 'react';

import { InstanceTypes } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { VirtualMachineInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineClusterInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import { isRedHatInstanceType } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { MenuItem, MenuSearch, MenuSearchInput, SearchInput } from '@patternfly/react-core';

type UserInstanceTypeMenuProps = {
  allInstanceTypes: InstanceTypes;
  onSelect: (kind: string, value: string) => void;
  selected: string;
  selectedKind: string;
};

const UserInstanceTypeMenu: FC<UserInstanceTypeMenuProps> = ({
  allInstanceTypes,
  onSelect,
  selected,
  selectedKind,
}) => {
  const { t } = useKubevirtTranslation();

  const [searchInput, setSearchInput] = useState('');

  const userCreatedInstanceTypes = allInstanceTypes.filter((it) => !isRedHatInstanceType(it));

  const filteredItems = useMemo(
    () =>
      userCreatedInstanceTypes.filter(
        (it) =>
          isEmpty(searchInput) ||
          getName(it).toLowerCase().includes(searchInput.toString().toLowerCase()),
      ),
    [userCreatedInstanceTypes, searchInput],
  );

  if (isEmpty(filteredItems)) return <MenuItem isDisabled>{t('No results found')}</MenuItem>;

  return (
    <>
      {filteredItems.length > 5 && (
        <MenuSearch>
          <MenuSearchInput>
            <SearchInput
              aria-label="Filter menu items"
              onChange={(_, value) => setSearchInput(value)}
              type="search"
              value={searchInput}
            />
          </MenuSearchInput>
        </MenuSearch>
      )}
      {filteredItems.map((it) => {
        const itName = getName(it);
        const itKind = it?.kind;
        return (
          <MenuItem
            icon={
              <ResourceIcon
                groupVersionKind={
                  itKind === VirtualMachineClusterInstancetypeModel.kind
                    ? VirtualMachineClusterInstancetypeModelGroupVersionKind
                    : VirtualMachineInstancetypeModelGroupVersionKind
                }
              />
            }
            isSelected={selected === itName && selectedKind === itKind}
            itemId={itName}
            key={itName}
            onClick={() => onSelect(itKind, itName)}
          >
            {itName}
          </MenuItem>
        );
      })}
    </>
  );
};
export default UserInstanceTypeMenu;
