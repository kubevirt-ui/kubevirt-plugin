import React, { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SearchInput, Split, SplitItem } from '@patternfly/react-core';

import { PhysicalNetwork } from '../../../../utils/types';

import NetworksSearchTypeSelect from './components/NetworksSearchTypeSelect';
import { NetworksSearchType } from './utils/types';
import { filterPhysicalNetworks } from './utils/utils';

import './SearchBar.scss';

type SearchBarProps = {
  physicalNetworks: PhysicalNetwork[];
  setFilteredNetworks: Dispatch<SetStateAction<PhysicalNetwork[]>>;
};

const SearchBar: FC<SearchBarProps> = ({ physicalNetworks, setFilteredNetworks }) => {
  const { t } = useKubevirtTranslation();
  const [searchType, setSearchType] = useState<NetworksSearchType>(NetworksSearchType.NAME);
  const [searchInput, setSearchInput] = useState('');

  const filtered = useMemo(
    () => filterPhysicalNetworks(physicalNetworks, searchType, searchInput),
    [physicalNetworks, searchInput, searchType],
  );
  setFilteredNetworks(filtered);

  return (
    <Split className="search-bar" hasGutter>
      <SplitItem>
        <NetworksSearchTypeSelect
          selectedSearchType={searchType}
          setSelectedSearchType={setSearchType}
        />
      </SplitItem>
      <SplitItem>
        <SearchInput
          aria-label={t('Filter physical networks search input')}
          className="pf-v6-u-mb-xl search-bar__search-input"
          onChange={(_, value) => setSearchInput(value)}
          placeholder={t('Search by name')}
          type="search"
          value={searchInput}
        />
      </SplitItem>
    </Split>
  );
};

export default SearchBar;
