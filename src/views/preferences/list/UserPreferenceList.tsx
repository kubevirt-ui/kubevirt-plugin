import React, { FC } from 'react';

import { VirtualMachinePreferenceModelRef } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachinePreferenceModel';
import { V1beta1VirtualMachinePreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import useUserPreferences from '@kubevirt-utils/hooks/useUserPreferences';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import UserPreferenceRow from './components/UserPreferenceRow';
import UserPreferencesEmptyState from './components/UserPreferencesEmptyState';
import useUserPreferenceListColumns from './hooks/useUserPreferenceListColumns';

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
  const activeNamespace = namespace ?? ALL_NAMESPACES;

  const [preferences, loaded, loadError] = useUserPreferences(
    activeNamespace,
    fieldSelector,
    selector,
  );

  const { onPaginationChange, pagination } = usePagination();
  const [unfilteredData, data, onFilterChange] = useListPageFilter<
    V1beta1VirtualMachinePreference,
    V1beta1VirtualMachinePreference
  >(preferences, null, {
    name: { selected: [nameFilter] },
  });
  const [columns, activeColumns, loadedColumns] = useUserPreferenceListColumns(pagination, data);

  if (loaded && isEmpty(unfilteredData)) {
    return <UserPreferencesEmptyState namespace={activeNamespace} />;
  }

  return (
    <ListPageBody>
      <div className="list-managment-group">
        <ListPageFilter
          columnLayout={{
            columns: columns?.map(({ additional, id, title }) => ({
              additional,
              id,
              title,
            })),
            id: VirtualMachinePreferenceModelRef,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('preferences'),
          }}
          onFilterChange={(...args) => {
            onFilterChange(...args);
            onPaginationChange({
              endIndex: pagination?.perPage,
              page: 1,
              perPage: pagination?.perPage,
              startIndex: 0,
            });
          }}
          data={unfilteredData}
          hideColumnManagement={hideColumnManagement}
          hideLabelFilter={hideTextFilter}
          hideNameLabelFilters={hideNameLabelFilters}
          loaded={loaded && loadedColumns}
        />
        {!isEmpty(data) && (
          <Pagination
            onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
              onPaginationChange({ endIndex, page, perPage, startIndex })
            }
            onSetPage={(_e, page, perPage, startIndex, endIndex) =>
              onPaginationChange({ endIndex, page, perPage, startIndex })
            }
            className="list-managment-group__pagination"
            isLastFullPageShown
            itemCount={data?.length}
            page={pagination?.page}
            perPage={pagination?.perPage}
            perPageOptions={paginationDefaultValues}
          />
        )}
      </div>
      <VirtualizedTable<V1beta1VirtualMachinePreference>
        EmptyMsg={() => (
          <div className="pf-u-text-align-center" id="no-preference-msg">
            {t('No preferences found')}
          </div>
        )}
        columns={activeColumns}
        data={data}
        loaded={loaded && loadedColumns}
        loadError={loadError}
        Row={UserPreferenceRow}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default UserPreferenceList;
