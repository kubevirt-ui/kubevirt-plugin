import React, { FC, useEffect, useMemo, useState } from 'react';
import { getOSImagesNS } from 'src/views/clusteroverview/OverviewTab/inventory-card/utils/utils';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { UseBootableVolumesValues } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { UserSettingFavorites } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
import { getBootableVolumePVCSource } from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { convertResourceArrayToMap, getLabel, getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Pagination, Split, SplitItem, TextInput } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import { DEFAULT_PREFERENCE_LABEL } from '../../utils/constants';
import BootableVolumeEmptyState from '../BootableVolumeEmptyState/BootableVolumeEmptyState';

import BootableVolumeRow from './components/BootableVolumeRow/BootableVolumeRow';
import ShowAllBootableVolumesButton from './components/ShowAllBootableVolumesButton/ShowAllBootableVolumesButton';
import useBootVolumeColumns from './hooks/useBootVolumeColumns';
import useBootVolumeFilters from './hooks/useBootVolumeFilters';
import useBootVolumeSortColumns from './hooks/useBootVolumeSortColumns';
import {
  paginationDefaultValuesForm,
  paginationDefaultValuesModal,
  paginationInitialStateForm,
  paginationInitialStateModal,
} from './utils/constants';
import { getPaginationFromVolumeIndex } from './utils/utils';

import './BootableVolumeList.scss';

type BootableVolumeListProps = {
  bootableVolumesData: UseBootableVolumesValues;
  displayShowAllButton?: boolean;
  favorites: UserSettingFavorites;
  preferencesData: V1beta1VirtualMachineClusterPreference[];
  selectedBootableVolumeState?: [BootableVolume, (selectedVolume: BootableVolume) => void];
};

const BootableVolumeList: FC<BootableVolumeListProps> = ({
  bootableVolumesData,
  displayShowAllButton = false,
  favorites,
  preferencesData,
  selectedBootableVolumeState,
}) => {
  const { t } = useKubevirtTranslation();
  const { instanceTypeVMState, onSelectCreatedVolume } = useInstanceTypeVMStore();

  const { selectedBootableVolume } = instanceTypeVMState;
  const { bootableVolumes, loaded, pvcSources, volumeSnapshotSources } = bootableVolumesData;

  const preferencesMap = useMemo(
    () => convertResourceArrayToMap(preferencesData),
    [preferencesData],
  );

  const { activeColumns, columnLayout, loadedColumns } = useBootVolumeColumns(
    !displayShowAllButton,
  );

  const filters = useBootVolumeFilters(!displayShowAllButton);

  const [unfilteredData, data, onFilterChange] = useListPageFilter(bootableVolumes, filters);

  const [pagination, setPagination] = useState(
    displayShowAllButton ? paginationInitialStateForm : paginationInitialStateModal,
  );

  const [volumeFavorites, updateFavorites] = favorites;
  const { getSortType, sortedData } = useBootVolumeSortColumns(
    data,
    volumeFavorites,
    preferencesMap,
    pvcSources,
    volumeSnapshotSources,
    pagination,
  );

  const onPageChange = ({ endIndex, page, perPage, startIndex }) => {
    setPagination(() => ({
      endIndex,
      page,
      perPage,
      startIndex,
    }));
  };

  const displayVolumes = !isEmpty(bootableVolumes) && loaded && loadedColumns;

  useEffect(() => {
    if (displayShowAllButton && !isEmpty(selectedBootableVolume)) {
      const selectedVolumeIndex = bootableVolumes?.findIndex(
        (volume) => getName(volume) === getName(selectedBootableVolume),
      );
      setPagination(getPaginationFromVolumeIndex(selectedVolumeIndex));
    }
  }, [selectedBootableVolume, bootableVolumes, displayShowAllButton]);

  return (
    <>
      <Split className="bootable-volume-list-bar" hasGutter>
        <SplitItem>
          <FormGroup label={t('Volumes project')}>
            <TextInput
              aria-label="bootable volume list"
              className="bootable-volume-list-bar__volume-namespace"
              isDisabled
              value={getOSImagesNS()}
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
                // hideLabelFilter
                // hideNameLabelFilters={!displayShowAllButton}
                loaded={Boolean(loaded) && loadedColumns}
                // nameFilter={!displayShowAllButton && "modal-name"} can remove comment once this merged https://github.com/openshift/console/pull/12438 and build into new SDK version
                rowFilters={filters}
              />
            </SplitItem>
            <SplitItem isFilled />
            <SplitItem className="bootable-volume-list-bar__pagination">
              <Pagination
                onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                  onPageChange({ endIndex, page, perPage, startIndex })
                }
                onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                  onPageChange({ endIndex, page, perPage, startIndex })
                }
                perPageOptions={
                  displayShowAllButton ? paginationDefaultValuesForm : paginationDefaultValuesModal
                }
                defaultToFullPage
                isCompact={displayShowAllButton}
                itemCount={data?.length}
                page={pagination?.page}
                perPage={pagination?.perPage}
              />
            </SplitItem>
            {displayShowAllButton && (
              <ShowAllBootableVolumesButton
                bootableVolumesData={bootableVolumesData}
                favorites={favorites}
                preferencesData={preferencesData}
              />
            )}
          </>
        )}
      </Split>

      {displayVolumes ? (
        <TableComposable className="BootableVolumeList-table" variant={TableVariant.compact}>
          <Thead>
            <Tr>
              {activeColumns.map((col, columnIndex) => (
                <Th
                  sort={
                    columnIndex === 0
                      ? { ...getSortType(columnIndex), isFavorites: true }
                      : getSortType(columnIndex)
                  }
                  id={col?.id}
                  key={col?.id}
                >
                  {col?.title}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {sortedData.map((bs) => (
              <BootableVolumeRow
                rowData={{
                  bootableVolumeSelectedState: !displayShowAllButton
                    ? selectedBootableVolumeState
                    : [selectedBootableVolume, onSelectCreatedVolume],
                  favorites: [
                    volumeFavorites?.includes(bs?.metadata?.name),
                    (addTofavorites: boolean) =>
                      updateFavorites(
                        addTofavorites
                          ? [...volumeFavorites, bs?.metadata?.name]
                          : volumeFavorites.filter((fav: string) => fav !== bs?.metadata?.name),
                      ),
                  ],
                  preference: preferencesMap[getLabel(bs, DEFAULT_PREFERENCE_LABEL)],
                  pvcSource: getBootableVolumePVCSource(bs, pvcSources),
                  volumeSnapshotSource: volumeSnapshotSources?.[bs?.metadata?.name],
                }}
                activeColumnIDs={activeColumns?.map((col) => col?.id)}
                bootableVolume={bs}
                key={getName(bs)}
              />
            ))}
          </Tbody>
        </TableComposable>
      ) : (
        <BootableVolumeEmptyState />
      )}
    </>
  );
};

export default BootableVolumeList;
