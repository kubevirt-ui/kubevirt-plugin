import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import useClusterPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useClusterPreferences';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import { COLUMN_MANAGEMENT_IDS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import useSelectedRowFilterClusters from '@kubevirt-utils/hooks/useSelectedRowFilterClusters';
import useSelectedRowFilterProjects from '@kubevirt-utils/hooks/useSelectedRowFilterProjects';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import useHideDeprecatedBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useHideDeprecatedBootableVolumes';
import { isAllNamespaces, isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import {
  DocumentTitle,
  ListPageBody,
  ListPageHeader,
  useActiveNamespace,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination, Stack, StackItem } from '@patternfly/react-core';

import { BootableResource } from '../utils/types';

import BootableVolumeAddButton from './components/BootableVolumeAddButton';
import BootableVolumesEmptyState from './components/BootableVolumesEmptyState';
import useBootableVolumesFilters from './hooks/useBootableVolumesFilters';
import {
  BootableVolumeCallbacks,
  getBootableVolumeColumns,
  getBootableVolumeRowId,
} from './bootableVolumesDefinition';

import '@kubevirt-utils/styles/list-managment-group.scss';

const BootableVolumesList: FC = () => {
  const { ns: namespace } = useParams<{ cluster: string; ns: string }>();
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const isAllClustersPage = useIsAllClustersPage();
  const clusterParam = useClusterParam();
  const filteredClusters = useSelectedRowFilterClusters();
  const filteredNamespaces = useSelectedRowFilterProjects();
  const { bootableVolumes, dataImportCrons, dvSources, error, loaded } =
    useBootableVolumes(namespace);
  const [preferences] = useClusterPreferences();

  const { filtersWithSelect, rowFilters } = useBootableVolumesFilters(bootableVolumes);
  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter(bootableVolumes, [
    ...filtersWithSelect,
    ...rowFilters,
  ]);

  const { handleFilterChange, handlePerPageSelect, handleSetPage, pagination } =
    usePaginationWithFilters(filteredData?.length ?? 0, onFilterChange);

  const columns = useMemo(
    () =>
      getBootableVolumeColumns(
        t,
        isAllClustersPage,
        isAllNamespaces(activeNamespace),
        preferences ?? [],
      ),
    [t, isAllClustersPage, activeNamespace, preferences],
  );

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: COLUMN_MANAGEMENT_IDS.BOOTABLE_VOLUMES,
    columns,
  });

  const columnLayout = useMemo(
    () =>
      buildColumnLayout(
        columns,
        activeColumnKeys,
        COLUMN_MANAGEMENT_IDS.BOOTABLE_VOLUMES,
        t('Bootable volume'),
      ),
    [columns, activeColumnKeys, t],
  );

  const callbacks: BootableVolumeCallbacks = useMemo(
    () => ({
      clusterParam,
      dataImportCrons,
      dvSources,
      preferences: preferences ?? [],
    }),
    [clusterParam, dataImportCrons, dvSources, preferences],
  );

  useHideDeprecatedBootableVolumes(handleFilterChange);

  const isLoaded = loaded && loadedColumns;

  if (
    loaded &&
    !error &&
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
              columnLayout={columnLayout}
              data={unfilteredData}
              filtersWithSelect={filtersWithSelect}
              loaded={isLoaded}
              onFilterChange={handleFilterChange}
              rowFilters={rowFilters}
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
          </StackItem>

          <KubevirtTable<BootableResource, BootableVolumeCallbacks>
            activeColumnKeys={activeColumnKeys}
            ariaLabel={t('Bootable volumes table')}
            callbacks={callbacks}
            columns={columns}
            data={filteredData ?? []}
            dataTest="bootable-volumes-list"
            getRowId={getBootableVolumeRowId}
            loaded={isLoaded}
            loadError={error}
            noDataMsg={t('No bootable volumes found')}
            pagination={pagination}
            unfilteredData={unfilteredData}
          />
        </Stack>
      </ListPageBody>
    </>
  );
};

export default BootableVolumesList;
