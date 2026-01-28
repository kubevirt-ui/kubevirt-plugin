import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import { paginationDefaultValues } from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/components/UserProvidedInstanceTypeList/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { ActionList, ActionListItem, Pagination } from '@patternfly/react-core';
import { Table, Th, Thead, Tr } from '@patternfly/react-table';

import { ConfigurationDetails, PhysicalNetwork, PhysicalNetworks } from '../../utils/types';

import PhysicalNetworkRow from './components/PhysicalNetworkRow/PhysicalNetworkRow';
import SearchBar from './components/SearchBar/SearchBar';
import { PhysicalNetworkColumnIDs } from './utils/constants';
import usePhysicalNetworkColumns from './utils/hooks/usePhysicalNetworksColumns';

import './PhysicalNetworksTable.scss';

type PhysicalNetworksTableProps = {
  physicalNetworks: PhysicalNetworks;
  setSelectedConfiguration: Dispatch<SetStateAction<ConfigurationDetails>>;
};

const PhysicalNetworksTable: FC<PhysicalNetworksTableProps> = ({
  physicalNetworks,
  setSelectedConfiguration,
}) => {
  const { t } = useKubevirtTranslation();
  const [filteredNetworks, setFilteredNetworks] = useState<PhysicalNetwork[]>(physicalNetworks);
  const [expandedNetworkNames, setExpandedNetworkNames] = useState<string[]>([]);

  const { onPaginationChange, pagination } = usePagination();
  const { columns, getSortType, sortedData } = usePhysicalNetworkColumns(
    filteredNetworks,
    pagination,
  );

  const setNetworkExpanded = (network: PhysicalNetwork, isExpanding = true) =>
    setExpandedNetworkNames((prevExpanded) => {
      const otherExpandedNetworkNames = prevExpanded.filter((r) => r !== network.name);
      return isExpanding ? [...otherExpandedNetworkNames, network.name] : otherExpandedNetworkNames;
    });

  return (
    <div className="physical-networks-table">
      <ActionList className="physical-networks-table__action-list">
        <ActionListItem>
          <SearchBar
            physicalNetworks={physicalNetworks}
            setFilteredNetworks={setFilteredNetworks}
          />
        </ActionListItem>
        <ActionListItem>
          <Pagination
            onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
              onPaginationChange({ endIndex, page, perPage, startIndex })
            }
            onSetPage={(_e, page, perPage, startIndex, endIndex) =>
              onPaginationChange({ endIndex, page, perPage, startIndex })
            }
            className="list-managment-group__pagination"
            isCompact
            itemCount={sortedData?.length}
            page={pagination?.page}
            perPage={pagination?.perPage}
            perPageOptions={paginationDefaultValues}
          />
        </ActionListItem>
      </ActionList>
      <Table aria-label={t('Physical networks table')} isExpandable>
        <Thead>
          <Tr>
            <Th screenReaderText="Row expansion" />
            {columns?.map(({ id, title }, columnIndex) => {
              return (
                <>
                  {id !== PhysicalNetworkColumnIDs.Expand && (
                    <Th key={id} sort={getSortType(columnIndex)}>
                      {title}
                    </Th>
                  )}
                </>
              );
            })}
          </Tr>
        </Thead>
        {sortedData.map((network, rowIndex) => (
          <PhysicalNetworkRow
            expandedNetworks={expandedNetworkNames}
            index={rowIndex}
            key={network.name}
            network={network}
            setNetworkExpanded={setNetworkExpanded}
            setSelectedConfiguration={setSelectedConfiguration}
          />
        ))}
      </Table>
    </div>
  );
};

export default PhysicalNetworksTable;
