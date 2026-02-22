import React, { FC, useState } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import useClusterPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useClusterPreferences';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import useSelectedRowFilterClusters from '@kubevirt-utils/hooks/useSelectedRowFilterClusters';
import useSelectedRowFilterProjects from '@kubevirt-utils/hooks/useSelectedRowFilterProjects';
import { DataSourceModelRef } from '@kubevirt-utils/models';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import useHideDeprecatedBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useHideDeprecatedBootableVolumes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  DocumentTitle,
  K8sResourceCommon,
  ListPageBody,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination, Stack, StackItem } from '@patternfly/react-core';

import BootableVolumeAddButton from './components/BootableVolumeAddButton';
import BootableVolumesEmptyState from './components/BootableVolumesEmptyState';
import BootableVolumesRow from './components/BootableVolumesRow';
import useBootableVolumesColumns from './hooks/useBootableVolumesColumns';
import useBootableVolumesFilters from './hooks/useBootableVolumesFilters';

import '@kubevirt-utils/styles/list-managment-group.scss';

const BootableVolumesList: FC = () => {
  const { ns: namespace } = useParams<{ cluster: string; ns: string }>();
  const { t } = useKubevirtTranslation();
  const filteredClusters = useSelectedRowFilterClusters();
  const filteredNamespaces = useSelectedRowFilterProjects();
  const { bootableVolumes, dataImportCrons, dvSources, error, loaded } =
    useBootableVolumes(namespace);
  const [preferences] = useClusterPreferences();

  const { filtersWithSelect, rowFilters } = useBootableVolumesFilters(bootableVolumes);
  const [data, filteredData, onFilterChange] = useListPageFilter(bootableVolumes, [
    ...filtersWithSelect,
    ...rowFilters,
  ]);
  const [pagination, setPagination] = useState(paginationInitialState);
  const [columns, activeColumns, loadedColumns] = useBootableVolumesColumns(
    pagination,
    filteredData,
    preferences,
  );

  useHideDeprecatedBootableVolumes(onFilterChange);

  const onPageChange = ({ endIndex, page, perPage, startIndex }) => {
    setPagination(() => ({
      endIndex,
      page,
      perPage,
      startIndex,
    }));
  };

  if (
    loaded &&
    isEmpty(bootableVolumes) &&
    isEmpty(filteredClusters) &&
    isEmpty(filteredNamespaces)
  ) {
    return <BootableVolumesEmptyState namespace={namespace} />;
  }

  return (
    <>
      <DocumentTitle>{PageTitles.BootableVolumes}</DocumentTitle>
      <ListPageHeader title={PageTitles.BootableVolumes}>
        <BootableVolumeAddButton namespace={namespace} />
      </ListPageHeader>

      <ListPageBody>
        <Stack hasGutter>
          <StackItem>{t('View and manage available bootable volumes.')}</StackItem>

          <StackItem className="list-managment-group">
            <ListPageFilter
              columnLayout={{
                columns: columns?.map(({ additional, id, title }) => ({
                  additional,
                  id,
                  title,
                })),
                id: DataSourceModelRef,
                selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
                type: t('DataSource'),
              }}
              onFilterChange={(...args) => {
                onFilterChange(...args);
                setPagination((prevPagination) => ({
                  ...prevPagination,
                  endIndex: prevPagination?.perPage,
                  page: 1,
                  startIndex: 0,
                }));
              }}
              data={data}
              filtersWithSelect={filtersWithSelect}
              loaded={loadedColumns}
              rowFilters={rowFilters}
            />
            {!isEmpty(filteredData) && (
              <Pagination
                onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                  onPageChange({ endIndex, page, perPage, startIndex })
                }
                onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                  onPageChange({ endIndex, page, perPage, startIndex })
                }
                className="list-managment-group__pagination"
                isLastFullPageShown
                itemCount={filteredData?.length}
                page={pagination?.page}
                perPage={pagination?.perPage}
                perPageOptions={paginationDefaultValues}
              />
            )}
          </StackItem>

          <VirtualizedTable<K8sResourceCommon>
            EmptyMsg={() => (
              <div className="pf-v6-u-text-align-center" id="no-bootable-volumes-msg">
                {t('No bootable volumes found')}
              </div>
            )}
            rowData={{
              dataImportCrons,
              dvSources,
              preferences,
            }}
            columns={activeColumns}
            data={filteredData}
            loaded={loaded && loadedColumns}
            loadError={error}
            Row={BootableVolumesRow}
            unfilteredData={data}
          />
        </Stack>
      </ListPageBody>
    </>
  );
};

export default BootableVolumesList;
