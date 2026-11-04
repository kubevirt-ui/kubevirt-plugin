import { type FC, useMemo } from 'react';

import { DataVolumeModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout, getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageHeader,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import { getDataVolumeColumns } from './dataVolumesDefinition';
import { getDataVolumeStatusFilter } from './DataVolumesListFilters';

import '@kubevirt-utils/styles/list-managment-group.scss';

type DataVolumesListProps = {
  kind: string;
  namespace: string;
};

const DataVolumesList: FC<DataVolumesListProps> = ({ kind, namespace }) => {
  const { t } = useKubevirtTranslation();

  const [dataVolumes, loaded, loadError] = useK8sWatchResource<V1beta1DataVolume[]>({
    isList: true,
    kind,
    namespace,
    namespaced: true,
  }) as [V1beta1DataVolume[], boolean, Error];

  const filterDefinitions = useMemo(() => getDataVolumeStatusFilter(t), [t]);
  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: dataVolumes ?? [],
    filterDefinitions,
  });

  const {
    handleFilterChange: handleSetFilters,
    handlePerPageSelect,
    handleSetPage,
    pagination,
  } = usePaginationWithFilters(filteredData?.length ?? 0, onSetFilters);

  const columns = useMemo(() => getDataVolumeColumns(t, namespace), [t, namespace]);

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: DataVolumeModelRef,
    columns,
  });

  const columnLayout = useMemo(
    () => buildColumnLayout(columns, activeColumnKeys, DataVolumeModelRef, t('DataVolume')),
    [columns, activeColumnKeys, t],
  );

  const isLoaded = loaded && loadedColumns;

  return (
    <>
      <ListPageHeader title={t('DataVolumes')} />
      <ListPageBody>
        <div className="list-managment-group">
          <KubevirtFilterToolbar
            clearAllFilters={clearAllFilters}
            columnLayout={columnLayout}
            data={dataVolumes}
            filterDefinitions={filterDefinitions}
            filters={filters}
            loaded={isLoaded}
            onSetFilters={handleSetFilters}
            toolbarEndContent={
              <KubevirtTableExport
                activeColumnKeys={activeColumnKeys}
                columns={columns}
                data={filteredData ?? []}
                exportKey={EXPORT_TABLE_KEYS.DATAVOLUMES}
                loaded={isLoaded}
              />
            }
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
          ariaLabel={t('DataVolumes table')}
          columns={columns}
          data={filteredData ?? []}
          dataTest="datavolumes-list"
          getRowId={getK8sRowId}
          loaded={isLoaded}
          loadError={loadError}
          noDataMsg={t("You don't have any DataVolumes yet")}
          pagination={pagination}
          persistSortInUrl
          unfilteredData={dataVolumes}
        />
      </ListPageBody>
    </>
  );
};

export default DataVolumesList;
