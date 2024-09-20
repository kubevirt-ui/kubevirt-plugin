import React, { FC, useEffect, useMemo, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { UseBootableVolumesValues } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { CREATE_VM_TAB } from '@catalog/CreateVMHorizontalNav/constants';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import ProjectDropdown from '@kubevirt-utils/components/ProjectDropdown/ProjectDropdown';
import { OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { UserSettingFavorites } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
import useHideDeprecatedBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useHideDeprecatedBootableVolumes';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { convertResourceArrayToMap, getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Split, SplitItem } from '@patternfly/react-core';

import BootableVolumeEmptyState from '../BootableVolumeEmptyState/BootableVolumeEmptyState';

import BootableVolumeListPagination from './components/BootableVolumeListPagination/BootableVolumeListPagination';
import BootableVolumesPipelinesHint from './components/BootableVolumesPipelinesHint/BootableVolumesPipelinesHint';
import BootableVolumeTable from './components/BootableVolumeTable/BootableVolumeTable';
import ShowAllBootableVolumesButton from './components/ShowAllBootableVolumesButton/ShowAllBootableVolumesButton';
import useBootVolumeColumns from './hooks/useBootVolumeColumns';
import useBootVolumeFilters from './hooks/useBootVolumeFilters';
import useBootVolumeSortColumns from './hooks/useBootVolumeSortColumns';
import { paginationInitialStateForm, paginationInitialStateModal } from './utils/constants';
import { getPaginationFromVolumeIndex } from './utils/utils';

import './BootableVolumeList.scss';

type BootableVolumeListProps = {
  bootableVolumesData: UseBootableVolumesValues;
  currentTab?: CREATE_VM_TAB;
  displayShowAllButton?: boolean;
  favorites: UserSettingFavorites;
  preferencesData: V1beta1VirtualMachineClusterPreference[];
  selectedBootableVolumeState?: [BootableVolume, (selectedVolume: BootableVolume) => void];
};

const BootableVolumeList: FC<BootableVolumeListProps> = ({
  bootableVolumesData,
  currentTab,
  displayShowAllButton = false,
  favorites,
  preferencesData,
  selectedBootableVolumeState,
}) => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();

  const {
    instanceTypeVMState,
    onSelectCreatedVolume,
    setVolumeListNamespace,
    volumeListNamespace,
  } = useInstanceTypeVMStore();

  const { pvcSource, selectedBootableVolume, volumeSnapshotSource } = instanceTypeVMState;
  const { bootableVolumes, loaded, pvcSources, volumeSnapshotSources } = bootableVolumesData;

  const preferencesMap = useMemo(
    () => convertResourceArrayToMap(preferencesData),
    [preferencesData],
  );

  const { activeColumns, columnLayout, loadedColumns } = useBootVolumeColumns(
    volumeListNamespace,
    !displayShowAllButton,
  );

  const filters = useBootVolumeFilters(!displayShowAllButton);

  const [unfilteredData, data, onFilterChange] = useListPageFilter(bootableVolumes, filters);

  const [pagination, setPagination] = useState(
    displayShowAllButton ? paginationInitialStateForm : paginationInitialStateModal,
  );

  useHideDeprecatedBootableVolumes(onFilterChange, currentTab);

  const [volumeFavorites] = favorites;

  const { getSortType, sortedData, sortedPaginatedData } = useBootVolumeSortColumns(
    data,
    volumeFavorites,
    preferencesMap,
    pvcSources,
    volumeSnapshotSources,
    pagination,
  );

  useEffect(() => {
    if (!isAdmin && volumeListNamespace === ALL_PROJECTS) {
      setVolumeListNamespace(OPENSHIFT_OS_IMAGES_NS);
    }
  }, [isAdmin, volumeListNamespace, setVolumeListNamespace]);

  const displayVolumes = !isEmpty(bootableVolumes) && loaded && loadedColumns;

  const onModalBootableVolumeSelect = (modalSelectedVolume: BootableVolume) => {
    const selectedVolumeIndex = sortedData?.findIndex(
      (volume) => getName(volume) === getName(modalSelectedVolume),
    );

    setPagination(getPaginationFromVolumeIndex(selectedVolumeIndex));

    onSelectCreatedVolume(modalSelectedVolume, pvcSource, volumeSnapshotSource);
  };

  return (
    <>
      <Split className="bootable-volume-list-bar" hasGutter>
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
                loaded={Boolean(loaded) && loadedColumns}
                // nameFilter={!displayShowAllButton && "modal-name"} can remove comment once this merged https://github.com/openshift/console/pull/12438 and build into new SDK version
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
                preferencesData={preferencesData}
              />
            )}
          </>
        )}
      </Split>
      {displayVolumes ? (
        <>
          <BootableVolumeTable
            selectedBootableVolumeState={
              !displayShowAllButton
                ? selectedBootableVolumeState
                : [selectedBootableVolume, onSelectCreatedVolume]
            }
            activeColumns={activeColumns}
            bootableVolumesData={bootableVolumesData}
            favorites={favorites}
            getSortType={getSortType}
            preferencesMap={preferencesMap}
            sortedPaginatedData={sortedPaginatedData}
          />
          <BootableVolumesPipelinesHint bootableVolumes={bootableVolumes} />
        </>
      ) : (
        <BootableVolumeEmptyState />
      )}
    </>
  );
};

export default BootableVolumeList;
