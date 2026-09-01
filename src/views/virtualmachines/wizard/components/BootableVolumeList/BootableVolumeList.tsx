import React, { type FC, useCallback, useState } from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { type OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { Card } from '@patternfly/react-core';

import BootableVolumeListContent from './components/BootableVolumeListContent/BootableVolumeListContent';
import BootableVolumeListToolbar from './components/BootableVolumeListToolbar/BootableVolumeListToolbar';
import useBootableVolumesTableData from './hooks/useBootableVolumesTableData';
import usePreferencesData from './hooks/usePreferencesData';
import { type BootableVolumeListProps } from './types';
import { getEffectiveVolumeNamespace } from './utils/utils';

import './BootableVolumeList.scss';

const BootableVolumeList: FC<BootableVolumeListProps> = ({
  bootableVolumesData,
  canCreateVolume,
  cluster,
  instanceTypesAndPreferencesData,
  loadError,
  lockedPreference,
  onCreateVolume,
  onSelectBootableVolume,
  onVolumeListNamespaceChange,
  preferenceName,
  selectedBootableVolume,
  showNoBootSourceHint,
  syncFiltersWithURL = true,
  volumeListNamespace,
}) => {
  const isAdmin = useIsAdmin();
  const effectiveNamespace = getEffectiveVolumeNamespace(volumeListNamespace, isAdmin);
  const { preferences: preferencesData } = instanceTypesAndPreferencesData;
  const { loaded } = bootableVolumesData;

  const { preferencesMap, userPreferencesLoaded, userPreferencesMap } = usePreferencesData(
    cluster,
    effectiveNamespace,
    preferencesData,
  );

  const {
    activeColumns,
    clearAllFilters,
    columnLayout,
    data,
    filterDefinitions,
    filters,
    getSortType,
    isEmptyVolumes,
    isManualFilterEmpty,
    isPreferenceFilterEmpty,
    loadedColumns,
    onSetFilters,
    pagination,
    setPagination,
    sortedPaginatedData,
    unfilteredData,
  } = useBootableVolumesTableData(
    effectiveNamespace,
    bootableVolumesData,
    preferencesMap,
    userPreferencesMap,
    preferenceName,
    syncFiltersWithURL,
  );

  const handleSetFilters: OnSetFilters = useCallback(
    (newFilters) => {
      onSetFilters(newFilters);
      setPagination((prev) => ({ ...prev, endIndex: prev.perPage, page: 1, startIndex: 0 }));
    },
    [onSetFilters, setPagination],
  );

  const isVolumesLoaded = loaded && loadedColumns && userPreferencesLoaded;
  const displayVolumes = isVolumesLoaded && !isEmptyVolumes && !isPreferenceFilterEmpty;
  const isVolumeListEmpty = isEmptyVolumes || isPreferenceFilterEmpty;

  const [isHeaderStuck, setIsHeaderStuck] = useState(false);
  const handleTableScroll = useCallback<React.UIEventHandler<HTMLDivElement>>((event) => {
    setIsHeaderStuck(event.currentTarget.scrollTop > 0);
  }, []);

  return (
    <Card className="bootable-volume-list pf-v6-u-p-lg">
      <div className="bootable-volume-list__container">
        <BootableVolumeListToolbar
          clearAllFilters={clearAllFilters}
          columnLayout={columnLayout}
          data={data}
          displayVolumes={displayVolumes}
          effectiveNamespace={effectiveNamespace}
          filterDefinitions={filterDefinitions}
          filters={filters}
          loaded={loaded}
          loadedColumns={loadedColumns}
          onSetFilters={handleSetFilters}
          onVolumeListNamespaceChange={onVolumeListNamespaceChange}
          pagination={pagination}
          setPagination={setPagination}
          unfilteredData={unfilteredData}
        />
        <div className="bootable-volume-list__table-wrapper" onScroll={handleTableScroll}>
          <BootableVolumeListContent
            activeColumns={activeColumns}
            bootableVolumesData={bootableVolumesData}
            canCreateVolume={canCreateVolume}
            displayVolumes={displayVolumes}
            getSortType={getSortType}
            isHeaderStuck={isHeaderStuck}
            isManualFilterEmpty={isManualFilterEmpty}
            isVolumeListEmpty={isVolumeListEmpty}
            isVolumesLoaded={isVolumesLoaded}
            loadError={loadError}
            lockedPreference={lockedPreference}
            onCreateVolume={onCreateVolume}
            onSelectBootableVolume={onSelectBootableVolume}
            preferenceName={preferenceName}
            preferencesMap={preferencesMap}
            selectedBootableVolume={selectedBootableVolume}
            showNoBootSourceHint={showNoBootSourceHint}
            sortedPaginatedData={sortedPaginatedData}
            userPreferencesMap={userPreferencesMap}
            volumeListNamespace={volumeListNamespace}
          />
        </div>
      </div>
    </Card>
  );
};

export default BootableVolumeList;
