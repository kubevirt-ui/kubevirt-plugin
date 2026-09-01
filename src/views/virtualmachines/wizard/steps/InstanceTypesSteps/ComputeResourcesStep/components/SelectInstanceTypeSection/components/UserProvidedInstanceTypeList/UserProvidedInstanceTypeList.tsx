import React, { type FC, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';

import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { isAllNamespaces, isEmpty } from '@kubevirt-utils/utils/utils';
import { ActionList, ActionListItem, Pagination, SearchInput } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { type InstanceTypes } from '@virtualmachines/wizard/utils/types';

import UserProvidedComputeResourcesEmptyState from './components/UserProvidedComputeResourcesEmptyState';
import UserProvidedInstanceTypesEmptyState from './components/UserProvidedInstanceTypesEmptyState';
import UserProvidedInstanceTypeTable from './components/UserProvidedInstanceTypeTable';
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
  const activeNamespace = useActiveNamespace();
  const { control, setValue } = useVMWizard();
  const selectedInstanceType = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_INSTANCE_TYPE,
  });
  const namespace = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT,
  });

  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState(paginationInitialState);

  const onPaginationChange = ({ endIndex, page, perPage, startIndex }: PaginationState): void => {
    setPagination({
      endIndex,
      page,
      perPage,
      startIndex,
    });
  };

  const filteredItems = useMemo(
    (): InstanceTypes =>
      userProvidedInstanceTypes.filter(
        (opt) =>
          isEmpty(searchInput) ||
          getName(opt).toLowerCase().includes(searchInput.toString().toLowerCase()),
      ),
    [searchInput, userProvidedInstanceTypes],
  );

  const { columns, getSortType, sortedData } = useInstanceTypeListColumns(
    filteredItems,
    pagination,
  );

  if (isAllNamespaces(activeNamespace) && isEmpty(userProvidedInstanceTypes)) {
    return <UserProvidedComputeResourcesEmptyState namespace={namespace} />;
  }

  const handleRowClick = (instanceTypeName: string, instanceTypeNamespace: string): void => {
    setValue(CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_INSTANCE_TYPE, {
      name: instanceTypeName,
      namespace: instanceTypeNamespace,
    });
  };

  return (
    <>
      {!isEmpty(userProvidedInstanceTypes) && (
        <ActionList className="instance-type-list__action-list">
          <ActionListItem>
            <SearchInput
              aria-label={t('Filter menu items')}
              className="instance-type-list__search"
              onChange={(_event, value): void => {
                setSearchInput(value);
                setPagination(paginationInitialState);
              }}
              placeholder={t('Search by name...')}
              type="search"
              value={searchInput}
            />
          </ActionListItem>
          <ActionListItem>
            <Pagination
              className="list-managment-group__pagination"
              isCompact
              itemCount={filteredItems?.length}
              onPerPageSelect={(_event, perPage, page, startIndex, endIndex): void =>
                onPaginationChange({ endIndex, page, perPage, startIndex })
              }
              onSetPage={(_event, page, perPage, startIndex, endIndex): void =>
                onPaginationChange({ endIndex, page, perPage, startIndex })
              }
              page={pagination?.page}
              perPage={pagination?.perPage}
              perPageOptions={paginationDefaultValues}
            />
          </ActionListItem>
        </ActionList>
      )}
      {isEmpty(userProvidedInstanceTypes) || isEmpty(filteredItems) ? (
        <UserProvidedInstanceTypesEmptyState
          isFilterEmpty={!isEmpty(userProvidedInstanceTypes) && isEmpty(filteredItems)}
        />
      ) : (
        <UserProvidedInstanceTypeTable
          columns={columns}
          getSortType={getSortType}
          onRowClick={handleRowClick}
          selectedInstanceType={selectedInstanceType}
          sortedData={sortedData}
        />
      )}
    </>
  );
};

export default UserProvidedInstanceTypesList;
