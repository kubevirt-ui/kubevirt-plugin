import React, { FCC, useEffect } from 'react';

import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import ProjectDropdown from '@kubevirt-utils/components/ProjectDropdown/ProjectDropdown';
import {
  KUBEVIRT_HYPERCONVERGED,
  KUBEVIRT_OS_IMAGES_NS,
  OPENSHIFT_OS_IMAGES_NS,
} from '@kubevirt-utils/constants/constants';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useHideDeprecatedBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useHideDeprecatedBootableVolumes';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { isEmpty, OS_IMAGES_NS } from '@kubevirt-utils/utils/utils';
import { Card, FormGroup, Skeleton, Split, SplitItem } from '@patternfly/react-core';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import usePreferencesData from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/usePreferencesData';
import {
  UseBootableVolumesValues,
  UseInstanceTypeAndPreferencesValues,
} from '@virtualmachines/creation-wizard/utils/types';

import BootableVolumeEmptyState from './components/BootableVolumeEmptyState/BootableVolumeEmptyState';
import BootableVolumeListPagination from './components/BootableVolumeListPagination/BootableVolumeListPagination';
import BootableVolumeTable from './components/BootableVolumeTable/BootableVolumeTable';
import ShowAllBootableVolumesButton from './components/ShowAllBootableVolumesButton/ShowAllBootableVolumesButton';
import useBootableVolumesTableData from './hooks/useBootableVolumesTableData';
import { getPaginationFromVolumeIndex } from './utils/utils';

import './BootableVolumeList.scss';

type BootableVolumeListProps = {
  bootableVolumesData: UseBootableVolumesValues;
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
};

const BootableVolumeList: FCC<BootableVolumeListProps> = ({
  bootableVolumesData,
  instanceTypesAndPreferencesData,
}) => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const operatorNamespace = operatorNamespaceSignal.value;
  const {
    dvSource,
    onSelectCreatedVolume,
    pvcSource,
    selectedBootableVolume,
    setVolumeListNamespace,
    volumeListNamespace,
    volumeSnapshotSource,
  } = useInstanceTypeVMStore();
  const { preferences: preferencesData } = instanceTypesAndPreferencesData;
  const { preferencesMap, userPreferencesData, userPreferencesLoaded, userPreferencesMap } =
    usePreferencesData(volumeListNamespace, preferencesData);

  const { bootableVolumes, loaded } = bootableVolumesData;

  const displayShowAllButton = true;

  const {
    activeColumns,
    columnLayout,
    data,
    favorites,
    filters,
    getSortType,
    loadedColumns,
    onFilterChange,
    pagination,
    setPagination,
    sortedData,
    sortedPaginatedData,
    unfilteredData,
  } = useBootableVolumesTableData(
    volumeListNamespace,
    displayShowAllButton,
    preferencesMap,
    userPreferencesMap,
  );

  useHideDeprecatedBootableVolumes(onFilterChange);

  useEffect(() => {
    if (isAdmin || volumeListNamespace !== ALL_PROJECTS) return;

    if (isEmpty(operatorNamespace)) {
      setVolumeListNamespace(OS_IMAGES_NS);
      return;
    }

    const osImagesNamespace =
      operatorNamespace === KUBEVIRT_HYPERCONVERGED
        ? KUBEVIRT_OS_IMAGES_NS
        : OPENSHIFT_OS_IMAGES_NS;

    setVolumeListNamespace(osImagesNamespace);
  }, [isAdmin, volumeListNamespace, setVolumeListNamespace, operatorNamespace]);

  const isVolumesLoaded = loaded && loadedColumns && userPreferencesLoaded;
  const isEmptyVolumes = isEmpty(bootableVolumes);
  const displayVolumes = isVolumesLoaded && !isEmptyVolumes;

  const onModalBootableVolumeSelect = (modalSelectedVolume: BootableVolume) => {
    const selectedVolumeIndex = sortedData?.findIndex(
      (volume) => getName(volume) === getName(modalSelectedVolume),
    );

    setPagination(getPaginationFromVolumeIndex(selectedVolumeIndex));

    onSelectCreatedVolume(modalSelectedVolume, pvcSource, volumeSnapshotSource, dvSource);
  };

  return (
    <Card className="bootable-volume-list pf-v6-u-p-lg">
      <div className="bootable-volume-list__container">
        <Split hasGutter>
          <SplitItem>
            <FormGroup
              className="bootable-volume-list-bar__volume-namespace"
              label={t('Volumes project')}
            >
              <ProjectDropdown
                includeAllProjects={isAdmin}
                onChange={setVolumeListNamespace}
                selectedProject={volumeListNamespace}
              />
            </FormGroup>
          </SplitItem>

          {displayVolumes && (
            <>
              <SplitItem className="bootable-volume-list-bar__filter">
                <ListPageFilter
                  onFilterChange={(...args) => {
                    onFilterChange(...args);
                    setPagination((prevPagination) => ({
                      ...prevPagination,
                      endIndex: prevPagination?.perPage,
                      page: 1,
                      startIndex: 0,
                    }));
                  }}
                  columnLayout={columnLayout}
                  data={unfilteredData}
                  hideLabelFilter
                  hideNameLabelFilters={!displayShowAllButton}
                  loaded={loaded && loadedColumns}
                  rowFilters={filters}
                />
              </SplitItem>
              <SplitItem isFilled />
              <SplitItem className="bootable-volume-list-bar__pagination">
                <BootableVolumeListPagination
                  data={data}
                  displayShowAllButton={displayShowAllButton}
                  pagination={pagination}
                  setPagination={setPagination}
                />
              </SplitItem>
              {displayShowAllButton && (
                <ShowAllBootableVolumesButton
                  bootableVolumesData={bootableVolumesData}
                  favorites={favorites}
                  onSelect={onModalBootableVolumeSelect}
                  preferencesData={instanceTypesAndPreferencesData}
                  userPreferencesData={userPreferencesData}
                />
              )}
            </>
          )}
        </Split>
        {displayVolumes && (
          <>
            <BootableVolumeTable
              activeColumns={activeColumns}
              bootableVolumesData={bootableVolumesData}
              favorites={favorites}
              getSortType={getSortType}
              preferencesMap={preferencesMap}
              selectedBootableVolumeState={[selectedBootableVolume, onSelectCreatedVolume]}
              sortedPaginatedData={sortedPaginatedData}
              userPreferencesMap={userPreferencesMap}
            />
          </>
        )}
        {isVolumesLoaded && isEmptyVolumes && <BootableVolumeEmptyState />}
        {!isVolumesLoaded && (
          <>
            <Skeleton className="pf-v6-u-my-md" />
            <Skeleton className="pf-v6-u-my-md" />
            <Skeleton className="pf-v6-u-my-md" />
          </>
        )}
      </div>
    </Card>
  );
};

export default BootableVolumeList;
