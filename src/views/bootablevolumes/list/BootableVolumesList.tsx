import React, { FC, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import useClusterPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useClusterPreferences';
import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { DataSourceModelRef } from '@kubevirt-utils/models';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageCreateDropdown,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination, Stack, StackItem } from '@patternfly/react-core';

import BootableVolumesRow from './components/BootableVolumesRow';
import useBootableVolumesColumns from './hooks/useBootableVolumesColumns';
import useBootableVolumesFilters from './hooks/useBootableVolumesFilters';

import '@kubevirt-utils/styles/list-managment-group.scss';

const BootableVolumesList: FC<RouteComponentProps<{ ns: string }>> = ({ match }) => {
  const namespace = match.params.ns;
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const { createModal } = useModal();
  const { bootableVolumes, error, loaded } = useBootableVolumes(namespace);

  const { canCreateDS, canCreatePVC, canListInstanceTypesPrefernce } =
    useCanCreateBootableVolume(namespace);

  const [preferences] = useClusterPreferences();

  const [data, filteredData, onFilterChange] = useListPageFilter(
    bootableVolumes,
    useBootableVolumesFilters(),
  );
  const [pagination, setPagination] = useState(paginationInitialState);
  const [columns, activeColumns] = useBootableVolumesColumns(pagination, filteredData, preferences);

  const onPageChange = ({ endIndex, page, perPage, startIndex }) => {
    setPagination(() => ({
      endIndex,
      page,
      perPage,
      startIndex,
    }));
  };

  const createItems = {
    form: t('With form'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) => {
    return type === 'form'
      ? createModal((props) => <AddBootableVolumeModal {...props} />)
      : history.push(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${DataSourceModelRef}/~new`);
  };

  return (
    <>
      <ListPageHeader title={t('Bootable volumes')}>
        {(canCreateDS || canCreatePVC) && canListInstanceTypesPrefernce && (
          <ListPageCreateDropdown items={createItems} onClick={onCreate}>
            {t('Add volume')}
          </ListPageCreateDropdown>
        )}
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
              loaded={loaded}
              rowFilters={useBootableVolumesFilters()}
            />
            <Pagination
              onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                onPageChange({ endIndex, page, perPage, startIndex })
              }
              onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                onPageChange({ endIndex, page, perPage, startIndex })
              }
              className="list-managment-group__pagination"
              defaultToFullPage
              itemCount={filteredData?.length}
              page={pagination?.page}
              perPage={pagination?.perPage}
              perPageOptions={paginationDefaultValues}
            />
          </StackItem>

          <VirtualizedTable<K8sResourceCommon>
            rowData={{
              preferences,
            }}
            columns={activeColumns}
            data={filteredData}
            loaded={loaded}
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
