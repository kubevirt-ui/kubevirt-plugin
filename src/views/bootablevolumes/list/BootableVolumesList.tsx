import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router';

import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import useClusterPreferences from '@kubevirt-utils/hooks/useClusterPreferences';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import { COLUMN_MANAGEMENT_IDS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import { isAllNamespaces, isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import {
  DocumentTitle,
  ListPageBody,
  ListPageHeader,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination, Stack, StackItem } from '@patternfly/react-core';

import { BootableResource } from '../utils/types';

import {
  BootableVolumeCallbacks,
  getBootableVolumeColumns,
  getBootableVolumeRowId,
} from './bootableVolumesDefinition';
import BootableVolumeAddButton from './components/BootableVolumeAddButton';
import BootableVolumesEmptyState from './components/BootableVolumesEmptyState';
import useBootableVolumesFilters from './hooks/useBootableVolumesFilters';

import '@kubevirt-utils/styles/list-managment-group.scss';

const BootableVolumesList: FC = () => {
  const { ns: namespace } = useParams<{ cluster: string; ns: string }>();
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const isAllClustersPage = useIsAllClustersPage();
  const clusterParam = useClusterParam();
  const { bootableVolumes, dataImportCrons, dvSources, error, loaded } =
    useBootableVolumes(namespace);
  const [preferences] = useClusterPreferences();

  const filterDefinitions = useBootableVolumesFilters(bootableVolumes);
  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: bootableVolumes,
    filterDefinitions,
  });

  const {
    handlePerPageSelect,
    handleSetPage,
    pagination,
    handleFilterChange: handleSetFilters,
  } = usePaginationWithFilters(filteredData?.length ?? 0, onSetFilters);

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

  const toolbarEndContent = (
    <KubevirtTableExport<BootableResource, BootableVolumeCallbacks>
      activeColumnKeys={activeColumnKeys}
      callbacks={callbacks}
      columns={columns}
      data={filteredData ?? []}
      exportKey={EXPORT_TABLE_KEYS.BOOTABLE_VOLUMES}
      loaded={loaded && loadedColumns}
    />
  );

  const isLoaded = loaded && loadedColumns;

  if (loaded && !error && isEmpty(bootableVolumes)) {
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
            <KubevirtFilterToolbar
              clearAllFilters={clearAllFilters}
              columnLayout={columnLayout}
              data={bootableVolumes}
              filterDefinitions={filterDefinitions}
              filters={filters}
              loaded={isLoaded}
              onSetFilters={handleSetFilters}
              toolbarEndContent={toolbarEndContent}
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
            noDataMsg={t("You don't have any bootable volumes yet")}
            pagination={pagination}
            unfilteredData={bootableVolumes}
          />
        </Stack>
      </ListPageBody>
    </>
  );
};

export default BootableVolumesList;
