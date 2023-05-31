import React, { FC, useState } from 'react';

import AddBootableVolumeButton from '@catalog/CreateFromInstanceTypes/components/AddBootableVolumeButton/AddBootableVolumeButton';
import useBootableVolumes from '@catalog/CreateFromInstanceTypes/state/hooks/useBootableVolumes';
import useInstanceTypesAndPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useInstanceTypesAndPreferences';
import DeveloperPreviewLabel from '@kubevirt-utils/components/DeveloperPreviewLabel/DeveloperPreviewLabel';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { DataSourceModelRef } from '@kubevirt-utils/models';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { ButtonVariant, Pagination, Stack, StackItem } from '@patternfly/react-core';

import BootableVolumesRow from './components/BootableVolumesRow';
import useBootableVolumesColumns from './hooks/useBootableVolumesColumns';
import useBootableVolumesFilters from './hooks/useBootableVolumesFilters';

import '@kubevirt-utils/styles/list-managment-group.scss';

const BootableVolumesList: FC = () => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const { bootableVolumes, loaded, loadError } = useBootableVolumes(
    activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace,
  );
  const { preferences } = useInstanceTypesAndPreferences();
  const [data, filteredData, onFilterChange] = useListPageFilter(
    bootableVolumes,
    useBootableVolumesFilters(),
  );
  const [pagination, setPagination] = useState(paginationInitialState);
  const [columns, activeColumns] = useBootableVolumesColumns(pagination, filteredData, preferences);

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
        <AddBootableVolumeButton buttonVariant={ButtonVariant.primary} />
      </ListPageHeader>

      <ListPageBody>
        <Stack hasGutter>
          <StackItem>{t('View and manage available bootable volumes.')}</StackItem>

          <StackItem className="list-managment-group">
            <ListPageFilter
              data={data}
              loaded={loaded}
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
              className="list-managment-group__pagination"
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
            loaded={loaded}
            loadError={loadError}
            columns={activeColumns}
            Row={BootableVolumesRow}
            rowData={{
              preferences,
            }}
          />
        </Stack>
      </ListPageBody>
    </>
  );
};

export default BootableVolumesList;
