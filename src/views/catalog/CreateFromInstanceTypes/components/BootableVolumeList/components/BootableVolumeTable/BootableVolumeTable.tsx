import React, { FC } from 'react';

import {
  InstanceTypeVMStore,
  UseBootableVolumesValues,
} from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { UserSettingFavorites } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
import {
  getBootableVolumePVCSource,
  getDataImportCronFromDataSource,
  getDataVolumeForPVC,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel, getName } from '@kubevirt-utils/resources/shared';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { Table, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';

import { FAVORITES_COLUMN_ID } from '../../utils/constants';
import BootableVolumeRow from '../BootableVolumeRow/BootableVolumeRow';

type BootableVolumeTableProps = {
  activeColumns: TableColumn<BootableVolume>[];
  bootableVolumesData: UseBootableVolumesValues;
  favorites: UserSettingFavorites;
  getSortType: (columnIndex: number) => ThSortType;
  preferencesMap: {
    [resourceKeyName: string]: V1beta1VirtualMachineClusterPreference;
  };
  selectedBootableVolumeState?: [BootableVolume, InstanceTypeVMStore['onSelectCreatedVolume']];
  sortedPaginatedData: BootableVolume[];
};

const BootableVolumeTable: FC<BootableVolumeTableProps> = ({
  activeColumns,
  bootableVolumesData,
  favorites,
  getSortType,
  preferencesMap,
  selectedBootableVolumeState,
  sortedPaginatedData,
}) => {
  const [volumeFavorites, updateFavorites] = favorites;
  const { dataImportCrons, dvSources, pvcSources, volumeSnapshotSources } = bootableVolumesData;

  return (
    <Table className="BootableVolumeList-table" variant={TableVariant.compact}>
      <Thead>
        <Tr>
          {activeColumns.map((col, columnIndex) => (
            <Th
              sort={
                col.id === FAVORITES_COLUMN_ID
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
        {sortedPaginatedData.map((bootSource) => {
          const bootSourceName = getName(bootSource);
          const pvcSource = getBootableVolumePVCSource(bootSource, pvcSources);

          return (
            <BootableVolumeRow
              rowData={{
                bootableVolumeSelectedState: selectedBootableVolumeState,
                dataImportCron: getDataImportCronFromDataSource(
                  dataImportCrons,
                  bootSource as V1beta1DataSource,
                ),
                dvSource: getDataVolumeForPVC(pvcSource, dvSources),
                favorites: [
                  volumeFavorites?.includes(bootSourceName),
                  (addTofavorites: boolean) =>
                    updateFavorites(
                      addTofavorites
                        ? [...volumeFavorites, bootSourceName]
                        : volumeFavorites.filter((fav: string) => fav !== bootSourceName),
                    ),
                ],
                preference: preferencesMap[getLabel(bootSource, DEFAULT_PREFERENCE_LABEL)],
                pvcSource,
                volumeSnapshotSource: volumeSnapshotSources?.[bootSourceName],
              }}
              activeColumnIDs={activeColumns?.map((col) => col?.id)}
              bootableVolume={bootSource}
              key={bootSourceName}
            />
          );
        })}
      </Tbody>
    </Table>
  );
};

export default BootableVolumeTable;
