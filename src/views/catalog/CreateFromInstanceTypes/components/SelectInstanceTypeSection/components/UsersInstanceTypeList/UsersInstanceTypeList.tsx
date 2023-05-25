import React, { FC, useMemo, useState } from 'react';

import { COMMON_INSTANCETYPES } from '@catalog/CreateFromInstanceTypes/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { instanceTypeActionType } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel, getName } from '@kubevirt-utils/resources/shared';
import { APP_NAME_LABEL } from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { ActionList, ActionListItem, Pagination, SearchInput } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import UsersInstanceTypeEmptyState from './components/UsersInstanceTypeEmptyState';
import useInstanceTypeListColumns from './hooks/useInstanceTypeListColumn';
import { paginationDefaultValues, paginationInitialState } from './utils/constants';

import './UsersInstanceTypeList.scss';

const UsersInstanceTypesList: FC = () => {
  const { t } = useKubevirtTranslation();

  const {
    instanceTypesAndPreferencesData: { instanceTypes },
    instanceTypeVMState: { selectedInstanceType },
    setInstanceTypeVMState,
  } = useInstanceTypeVMStore();

  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState(paginationInitialState);

  const onPaginationChange = ({ page, perPage, startIndex, endIndex }) => {
    setPagination({
      page,
      perPage,
      startIndex,
      endIndex,
    });
  };

  const userInstanceTypes = useMemo(
    () => instanceTypes.filter((it) => getLabel(it, APP_NAME_LABEL) !== COMMON_INSTANCETYPES),
    [instanceTypes],
  );

  const filteredItems = useMemo(() => {
    return userInstanceTypes.filter(
      (opt) =>
        isEmpty(searchInput) ||
        getName(opt).toLowerCase().includes(searchInput.toString().toLowerCase()),
    );
  }, [searchInput, userInstanceTypes]);

  const { columns, getSortType, sortedData } = useInstanceTypeListColumns(
    filteredItems,
    pagination,
  );

  return (
    <>
      {!isEmpty(userInstanceTypes) && (
        <ActionList className="instance-type-list__action-list">
          <ActionListItem>
            <SearchInput
              value={searchInput}
              aria-label="Filter menu items"
              type="search"
              onChange={(_, value) => setSearchInput(value)}
              placeholder={t('Search by name...')}
              className="instance-type-list__search"
            />
          </ActionListItem>
          <ActionListItem>
            <Pagination
              itemCount={filteredItems?.length}
              className="list-managment-group__pagination"
              page={pagination?.page}
              perPage={pagination?.perPage}
              onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                onPaginationChange({ page, perPage, startIndex, endIndex })
              }
              onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                onPaginationChange({ page, perPage, startIndex, endIndex })
              }
              perPageOptions={paginationDefaultValues}
              isCompact
            />
          </ActionListItem>
        </ActionList>
      )}
      {isEmpty(userInstanceTypes) || isEmpty(filteredItems) ? (
        <UsersInstanceTypeEmptyState />
      ) : (
        <TableComposable variant={TableVariant.compact}>
          <Thead>
            <Tr>
              {columns.map(({ id, title }, columnIndex) => (
                <Th key={id} sort={getSortType(columnIndex)}>
                  {title}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {sortedData.map((instanceType) => {
              const itName = getName(instanceType);
              return (
                <Tr
                  key={itName}
                  onRowClick={() =>
                    setInstanceTypeVMState({
                      type: instanceTypeActionType.setSelectedInstanceType,
                      payload: itName,
                    })
                  }
                  isSelectable
                  isHoverable
                  isRowSelected={selectedInstanceType === itName}
                >
                  <Td>
                    <ResourceLink
                      groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
                      linkTo={false}
                      name={itName}
                    />
                  </Td>
                  <Td>
                    <Timestamp timestamp={instanceType?.metadata?.creationTimestamp} />
                  </Td>
                  <Td>{instanceType?.metadata?.annotations?.description || NO_DATA_DASH}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </TableComposable>
      )}
    </>
  );
};

export default UsersInstanceTypesList;
