import React, { FC, useMemo } from 'react';

import { VirtualMachinePreferenceModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1VirtualMachinePreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isAllNamespaces, isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageBody, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import UserPreferencesEmptyState from './components/UserPreferencesEmptyState';
import { getUserPreferenceColumns, getUserPreferenceRowId } from './userPreferenceDefinition';

const UserPreferenceList: FC<ListPageProps> = ({
  fieldSelector,
  hideColumnManagement,
  hideNameLabelFilters,
  hideTextFilter,
  nameFilter,
  namespace,
  selector,
}) => {
  const { t } = useKubevirtTranslation();
  const currentNamespace = useActiveNamespace();
  const effectiveNamespace = namespace ?? currentNamespace ?? ALL_NAMESPACES_SESSION_KEY;

  const showNamespaceColumn = isAllNamespaces(effectiveNamespace);

  const [preferences, loaded, loadError] = useUserPreferences(
    effectiveNamespace,
    fieldSelector,
    selector,
  );

  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter<
    V1beta1VirtualMachinePreference,
    V1beta1VirtualMachinePreference
  >(preferences, null, {
    name: { selected: [nameFilter] },
  });

  const { handleFilterChange, handlePerPageSelect, handleSetPage, pagination } =
    usePaginationWithFilters(filteredData?.length ?? 0, onFilterChange);

  const columns = useMemo(
    () => getUserPreferenceColumns(t, showNamespaceColumn),
    [t, showNamespaceColumn],
  );

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: VirtualMachinePreferenceModelRef,
    columns,
  });

  const columnLayout = useMemo(
    () => buildColumnLayout(columns, activeColumnKeys, VirtualMachinePreferenceModelRef),
    [columns, activeColumnKeys],
  );

  const isLoaded = loaded && loadedColumns;

  if (isLoaded && !loadError && isEmpty(unfilteredData)) {
    return <UserPreferencesEmptyState namespace={effectiveNamespace} />;
  }

  return (
    <ListPageBody>
      <div className="list-managment-group">
        <ListPageFilter
          columnLayout={columnLayout}
          data={unfilteredData}
          hideColumnManagement={hideColumnManagement}
          hideLabelFilter={hideTextFilter}
          hideNameLabelFilters={hideNameLabelFilters}
          loaded={isLoaded}
          onFilterChange={handleFilterChange}
        />
        {!isEmpty(filteredData) && isLoaded && (
          <Pagination
            className="list-managment-group__pagination"
            isLastFullPageShown
            itemCount={filteredData?.length}
            onPerPageSelect={handlePerPageSelect}
            onSetPage={handleSetPage}
            page={pagination?.page}
            perPage={pagination?.perPage}
            perPageOptions={paginationDefaultValues}
          />
        )}
      </div>
      <KubevirtTable
        activeColumnKeys={activeColumnKeys}
        ariaLabel={t('User preferences table')}
        columns={columns}
        data={filteredData ?? []}
        dataTest="user-preference-list"
        getRowId={getUserPreferenceRowId}
        loaded={isLoaded}
        loadError={loadError}
        noDataMsg={t('No preferences found')}
        pagination={pagination}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default UserPreferenceList;
