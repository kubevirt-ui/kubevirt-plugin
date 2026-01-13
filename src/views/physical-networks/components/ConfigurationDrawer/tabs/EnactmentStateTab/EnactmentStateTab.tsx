import React, { FC, useMemo, useState } from 'react';

import { SearchInput, Split, SplitItem } from '@patternfly/react-core';

import {
  ConfigurationDetails,
  EnactmentState,
  NodeEnactmentStateDetails,
} from '../../../../utils/types';

import EnactmentStateFilter from './components/EnactmentStateFilter/EnactmentStateFilter';
import EnactmentStateTable from './components/EnactmentStateTable/EnactmentStateTable';
import { filterEnactmentStateDetails } from './utils/utils';

type EnactmentStateTabProps = {
  selectedConfiguration: ConfigurationDetails;
};

const EnactmentStateTab: FC<EnactmentStateTabProps> = ({ selectedConfiguration }) => {
  const [searchInput, setSearchInput] = useState('');
  const [enactmentStateFilters, setEnactmentStateFilters] = useState<EnactmentState[]>([
    EnactmentState.Progressing,
    EnactmentState.Available,
    EnactmentState.Aborted,
    EnactmentState.Failing,
    EnactmentState.Pending,
  ]);
  const { nodeToEnactmentStateMap } = selectedConfiguration;

  const filteredEnactmentStates: NodeEnactmentStateDetails[] = useMemo(() => {
    const nodeEnactmentStatePairs = Object.values(nodeToEnactmentStateMap || {}) || [];
    return filterEnactmentStateDetails(nodeEnactmentStatePairs, searchInput, enactmentStateFilters);
  }, [enactmentStateFilters, nodeToEnactmentStateMap, searchInput]);

  return (
    <div className="pf-v6-u-my-xl">
      <Split hasGutter>
        <SplitItem>
          <EnactmentStateFilter
            selectedFilterType={enactmentStateFilters}
            setSelectedFilterType={setEnactmentStateFilters}
          />
        </SplitItem>
        <SplitItem>
          <SearchInput
            aria-label="Filter nodes"
            className="pf-v6-u-mb-xl"
            onChange={(_, value) => setSearchInput(value)}
            type="search"
            value={searchInput}
          />
        </SplitItem>
      </Split>
      <EnactmentStateTable nodeEnactmentStateDetails={filteredEnactmentStates} />
    </div>
  );
};

export default EnactmentStateTab;
