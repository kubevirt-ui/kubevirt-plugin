import React, { FC, useCallback, useMemo } from 'react';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageBody, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';

import { getJobByName } from '../../utils/utils';
import useCheckupsSelfValidationData from '../components/hooks/useCheckupsSelfValidationData';
import useCheckupsSelfValidationListColumns from '../components/hooks/useCheckupsSelfValidationListColumns';
import useCheckupsSelfValidationListFilters from '../components/hooks/useCheckupsSelfValidationListFilters';
import useCheckupsSelfValidationPermissions from '../components/hooks/useCheckupsSelfValidationPermissions';

import CheckupsSelfValidationListEmptyState from './CheckupsSelfValidationListEmptyState';
import CheckupsSelfValidationListRow from './CheckupsSelfValidationListRow';

const CheckupsSelfValidationList: FC = () => {
  const { t } = useKubevirtTranslation();

  const {
    clusterRoleBinding,
    isPermitted,
    isPermittedToInstall,
    loading: loadingPermissions,
  } = useCheckupsSelfValidationPermissions();
  const { configMaps, error, jobs, loaded } = useCheckupsSelfValidationData();

  const { onPaginationChange, pagination } = usePagination();
  const [unfilteredData, filteredData, onFilterChange, filters] =
    useCheckupsSelfValidationListFilters(configMaps || []);
  const [columns, activeColumns, loadedColumns] = useCheckupsSelfValidationListColumns(jobs);

  const rowData = useMemo(
    () => ({
      getJobByName: (configMapName: string): IoK8sApiBatchV1Job[] =>
        getJobByName(jobs, configMapName, false),
    }),
    [jobs],
  );

  const columnLayout = useMemo(
    () => ({
      columns: (columns || [])?.map(({ id, title }) => ({ id, title })),
      id: 'checkups-self-validation',
      selectedColumns: new Set((activeColumns || [])?.map((col) => col?.id)),
      type: t('Checkups'),
    }),
    [columns, activeColumns, t],
  );

  const EmptyMsg = useCallback(
    () => <div className="pf-v6-u-text-align-center">{t('No self validation checkups found')}</div>,
    [t],
  );

  const handlePerPageSelect = useCallback(
    (_e, perPage, page, startIndex, endIndex) =>
      onPaginationChange({ endIndex, page, perPage, startIndex }),
    [onPaginationChange],
  );

  const handleSetPage = useCallback(
    (_e, page, perPage, startIndex, endIndex) =>
      onPaginationChange({ endIndex, page, perPage, startIndex }),
    [onPaginationChange],
  );

  if (isEmpty(configMaps) && loaded && loadedColumns) {
    return (
      <CheckupsSelfValidationListEmptyState
        clusterRoleBinding={clusterRoleBinding}
        isPermitted={isPermitted}
        isPermittedToInstall={isPermittedToInstall}
        loadingPermissions={loadingPermissions}
      />
    );
  }

  return (
    <ListPageBody>
      <div className="list-managment-group">
        <ListPageFilter
          columnLayout={columnLayout}
          data={unfilteredData}
          loaded={loaded && !!loadedColumns}
          onFilterChange={onFilterChange}
          rowFilters={filters}
        />
        {!isEmpty(filteredData) && loaded && (
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
      <VirtualizedTable<IoK8sApiCoreV1ConfigMap>
        columns={activeColumns || []}
        data={filteredData}
        EmptyMsg={EmptyMsg}
        loaded={loaded && !!loadedColumns}
        loadError={error}
        Row={CheckupsSelfValidationListRow}
        rowData={rowData}
        sortColumnIndex={3}
        sortDirection={SortByDirection.desc}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default CheckupsSelfValidationList;
