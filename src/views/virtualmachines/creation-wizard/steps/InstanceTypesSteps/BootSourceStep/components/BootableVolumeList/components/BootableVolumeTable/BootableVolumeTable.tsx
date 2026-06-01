import React, { FC } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getBootableVolumePVCSource,
  getDataImportCronFromDataSource,
  getDataVolumeForPVC,
  getPreference,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName, NamespacedResourceMap, ResourceMap } from '@kubevirt-utils/resources/shared';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { Table, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import { InstanceTypeVMStore } from '@virtualmachines/creation-wizard/state/instance-type-vm-store/utils/types';
import { UseBootableVolumesValues } from '@virtualmachines/creation-wizard/utils/types';

import BootableVolumeRow from '../BootableVolumeRow/BootableVolumeRow';

type BootableVolumeTableProps = {
  activeColumns: TableColumn<BootableVolume>[];
  bootableVolumesData: UseBootableVolumesValues;
  getSortType: (columnIndex: number) => ThSortType;
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>;
  selectedBootableVolumeState?: [BootableVolume, InstanceTypeVMStore['onSelectCreatedVolume']];
  sortedPaginatedData: BootableVolume[];
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>;
};

const BootableVolumeTable: FC<BootableVolumeTableProps> = ({
  activeColumns,
  bootableVolumesData,
  getSortType,
  preferencesMap,
  selectedBootableVolumeState,
  sortedPaginatedData,
  userPreferencesMap,
}) => {
  const { dataImportCrons, dvSources, pvcSources, volumeSnapshotSources } = bootableVolumesData;

  return (
    <Table className="BootableVolumeList-table" variant={TableVariant.compact}>
      <Thead>
        <Tr>
          {activeColumns.map((col, columnIndex) => (
            <Th id={col?.id} key={col?.id} sort={getSortType(columnIndex)}>
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
                preference: getPreference(bootSource, preferencesMap, userPreferencesMap),
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
