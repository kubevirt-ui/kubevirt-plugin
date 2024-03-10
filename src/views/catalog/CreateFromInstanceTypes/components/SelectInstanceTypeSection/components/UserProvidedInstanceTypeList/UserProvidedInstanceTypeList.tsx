import React, { FC, useMemo, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import {
  instanceTypeActionType,
  InstanceTypes,
} from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { groupVersionKindFromCommonResource } from '@catalog/CreateFromInstanceTypes/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isAllNamespaces, isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink, Timestamp, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionList,
  ActionListItem,
  Bullseye,
  Pagination,
  SearchInput,
} from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import UserProvidedInstanceTypesEmptyState from './components/UserProvidedInstanceTypesEmptyState';
import useInstanceTypeListColumns from './hooks/useInstanceTypeListColumn';
import { paginationDefaultValues, paginationInitialState } from './utils/constants';

import './UserProvidedInstanceTypeList.scss';

type UserProvidedInstanceTypesListProps = {
  userProvidedInstanceTypes: InstanceTypes;
};

const UserProvidedInstanceTypesList: FC<UserProvidedInstanceTypesListProps> = ({
  userProvidedInstanceTypes,
}) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();

  const {
    instanceTypeVMState: { selectedInstanceType },
    setInstanceTypeVMState,
  } = useInstanceTypeVMStore();

  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState(paginationInitialState);

  const onPaginationChange = ({ endIndex, page, perPage, startIndex }) => {
    setPagination({
      endIndex,
      page,
      perPage,
      startIndex,
    });
  };

  const filteredItems = useMemo(() => {
    return userProvidedInstanceTypes.filter(
      (opt) =>
        isEmpty(searchInput) ||
        getName(opt).toLowerCase().includes(searchInput.toString().toLowerCase()),
    );
  }, [searchInput, userProvidedInstanceTypes]);

  const { columns, getSortType, sortedData } = useInstanceTypeListColumns(
    filteredItems,
    pagination,
  );

  if (isAllNamespaces(activeNamespace) && isEmpty(userProvidedInstanceTypes)) {
    return (
      <Bullseye className={'instance-type-list__all-projects'}>
        {t('Select a project in order to see user-provided InstanceTypes')}
      </Bullseye>
    );
  }

  return (
    <>
      {!isEmpty(userProvidedInstanceTypes) && (
        <ActionList className="instance-type-list__action-list">
          <ActionListItem>
            <SearchInput
              aria-label="Filter menu items"
              className="instance-type-list__search"
              onChange={(_, value) => setSearchInput(value)}
              placeholder={t('Search by name...')}
              type="search"
              value={searchInput}
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
              itemCount={filteredItems?.length}
              page={pagination?.page}
              perPage={pagination?.perPage}
              perPageOptions={paginationDefaultValues}
            />
          </ActionListItem>
        </ActionList>
      )}
      {isEmpty(userProvidedInstanceTypes) || isEmpty(filteredItems) ? (
        <UserProvidedInstanceTypesEmptyState />
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
              const itNamespace = getNamespace(instanceType);
              return (
                <Tr
                  isRowSelected={
                    selectedInstanceType?.name === itName &&
                    selectedInstanceType?.namespace === itNamespace
                  }
                  onRowClick={() =>
                    setInstanceTypeVMState({
                      payload: { name: itName, namespace: itNamespace },
                      type: instanceTypeActionType.setSelectedInstanceType,
                    })
                  }
                  isHoverable
                  isSelectable
                  key={itName}
                >
                  <Td>
                    <ResourceLink
                      groupVersionKind={groupVersionKindFromCommonResource(instanceType)}
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

export default UserProvidedInstanceTypesList;
