import React, { FC, useState } from 'react';

import AddBootableVolumeButton from '@catalog/CreateFromInstanceTypes/components/AddBootableVolumeButton/AddBootableVolumeButton';
import useInstanceTypesAndPreferences from '@catalog/CreateFromInstanceTypes/hooks/useInstanceTypesAndPreferences';
import DeveloperPreviewLabel from '@kubevirt-utils/components/DeveloperPreviewLabel/DeveloperPreviewLabel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DataSourceModelGroupVersionKind, DataSourceModelRef } from '@kubevirt-utils/models';
import {
  convertResourceArrayToMap,
  getAvailableDataSources,
  getName,
} from '@kubevirt-utils/resources/shared';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Pagination, Stack, StackItem } from '@patternfly/react-core';
import { paginationDefaultValues, paginationInitialState } from '@virtualmachines/utils';

import BootableVolumesRow from './components/BootableVolumesRow';
import useBootableVolumes from './hooks/useBootableVolumes';
import useBootableVolumesColumns from './hooks/useBootableVolumesColumns';
import useBootableVolumesFilters from './hooks/useBootableVolumesFilters';

import './BootableVolumesList.scss';

const BootableVolumesList: FC = () => {
  const { t } = useKubevirtTranslation();
  const [dataSources, loadedDataSources, loadErrorDataSources] = useBootableVolumes();
  const { preferences, instanceTypes, loaded, loadError } = useInstanceTypesAndPreferences();
  const instanceTypesNames = (instanceTypes || []).map(getName).sort((a, b) => a.localeCompare(b));
  const [data, filteredData, onFilterChange] = useListPageFilter(
    getAvailableDataSources(dataSources),
    useBootableVolumesFilters(),
  );
  const [pagination, setPagination] = useState(paginationInitialState);
  const [columns, activeColumns] = useBootableVolumesColumns(pagination, filteredData);

  const onPageChange = ({ page, perPage, startIndex, endIndex }) => {
    setPagination(() => ({
      page,
      perPage,
      startIndex,
      endIndex,
    }));
  };

  return (
    <>
      <ListPageHeader title={t('Bootable volumes')} badge={<DeveloperPreviewLabel />}>
        <AddBootableVolumeButton
          preferencesNames={Object.keys(convertResourceArrayToMap(preferences))}
          instanceTypesNames={instanceTypesNames}
          loaded={loaded}
          loadError={loadError}
          buttonVariant={ButtonVariant.primary}
          buttonTitle={t('Add')}
        />
      </ListPageHeader>

      <ListPageBody>
        <Stack hasGutter>
          <StackItem>{t('View and manage available bootable volumes.')}</StackItem>

          <StackItem className="BootableVolumesList--filters__main">
            <ListPageFilter
              data={data}
              loaded={loadedDataSources}
              rowFilters={useBootableVolumesFilters()}
              onFilterChange={(...args) => {
                onFilterChange(...args);
                setPagination((prevPagination) => ({
                  ...prevPagination,
                  page: 1,
                  startIndex: 0,
                  endIndex: prevPagination?.perPage,
                }));
              }}
              columnLayout={{
                columns: columns?.map(({ id, title, additional }) => ({
                  id,
                  title,
                  additional,
                })),
                id: DataSourceModelRef,
                selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
                type: t('DataSource'),
              }}
            />
            <Pagination
              className="BootableVolumesList--filters__main-pagination"
              itemCount={filteredData?.length}
              page={pagination?.page}
              perPage={pagination?.perPage}
              defaultToFullPage
              onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                onPageChange({ page, perPage, startIndex, endIndex })
              }
              onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                onPageChange({ page, perPage, startIndex, endIndex })
              }
              perPageOptions={paginationDefaultValues}
            />
          </StackItem>

          <VirtualizedTable<K8sResourceCommon>
            data={filteredData}
            unfilteredData={data}
            loaded={loadedDataSources}
            loadError={loadErrorDataSources}
            columns={activeColumns}
            Row={BootableVolumesRow}
            rowData={{
              groupVersionKind: DataSourceModelGroupVersionKind,
              preferences,
              instanceTypesNames,
            }}
          />
        </Stack>
      </ListPageBody>
    </>
  );
};

export default BootableVolumesList;
