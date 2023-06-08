import React, { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import {
  DataSourceModelRef,
  VirtualMachineClusterPreferenceModelGroupVersionKind,
} from '@kubevirt-utils/models';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageCreateDropdown,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination, Stack, StackItem } from '@patternfly/react-core';

import BootableVolumesRow from './components/BootableVolumesRow';
import useBootableVolumesColumns from './hooks/useBootableVolumesColumns';
import useBootableVolumesFilters from './hooks/useBootableVolumesFilters';

import '@kubevirt-utils/styles/list-managment-group.scss';

type BootableVolumesListProps = {
  namespace: string;
};

const BootableVolumesList: FC<BootableVolumesListProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const { createModal } = useModal();
  const { bootableVolumes, loaded, error } = useBootableVolumes(namespace);

  const [preferences] = useK8sWatchResource<V1alpha2VirtualMachineClusterPreference[]>({
    groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
    isList: true,
  });

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
      <ListPageHeader title={t('Bootable resources')}>
        <ListPageCreateDropdown items={createItems} onClick={onCreate}>
          {t('Add bootable resource')}
        </ListPageCreateDropdown>
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
                id: 'bootable-volumes-list',
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
            loadError={error}
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
