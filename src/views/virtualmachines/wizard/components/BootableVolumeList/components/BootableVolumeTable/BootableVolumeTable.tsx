import React, { type FC } from 'react';

import {
  type V1beta1VirtualMachineClusterPreference,
  type V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  getName,
  getNamespace,
  type NamespacedResourceMap,
  type ResourceMap,
} from '@kubevirt-utils/resources/shared';
import { Table, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { type ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import { getBootableVolumeRowData } from '@virtualmachines/wizard/components/BootableVolumeList/utils/getBootableVolumeRowData';
import {
  type OnSelectBootableVolume,
  type UseBootableVolumesValues,
} from '@virtualmachines/wizard/utils/types';

import { type TableColumnWithOptionalIndex } from '../../types';
import BootableVolumeRow from '../BootableVolumeRow/BootableVolumeRow';

type BootableVolumeTableProps = {
  activeColumns: TableColumnWithOptionalIndex<BootableVolume>[];
  bootableVolumesData: UseBootableVolumesValues;
  getSortType: (columnIndex: number) => ThSortType;
  isHeaderStuck: boolean;
  onSelectBootableVolume: OnSelectBootableVolume;
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>;
  selectedBootableVolume?: BootableVolume;
  sortedPaginatedData: BootableVolume[];
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>;
  volumeListNamespace: string;
};

const BootableVolumeTable: FC<BootableVolumeTableProps> = ({
  activeColumns,
  bootableVolumesData,
  getSortType,
  isHeaderStuck,
  onSelectBootableVolume,
  preferencesMap,
  selectedBootableVolume,
  sortedPaginatedData,
  userPreferencesMap,
  volumeListNamespace,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Table
      aria-label={t('Bootable volumes')}
      className="BootableVolumeList-table"
      isStickyHeaderBase
      isStickyHeaderStuck={isHeaderStuck}
      variant={TableVariant.compact}
    >
      <Thead>
        <Tr>
          {activeColumns.map((col) => (
            <Th id={col.id} key={col.id} sort={getSortType(col.columnIndex)}>
              {col.title}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {sortedPaginatedData?.map?.((bootableVolume) => (
          <BootableVolumeRow
            activeColumnIDs={activeColumns.map((col) => col.id)}
            bootableVolume={bootableVolume}
            key={`${getNamespace(bootableVolume)}/${getName(bootableVolume)}`}
            onSelectBootableVolume={onSelectBootableVolume}
            rowData={getBootableVolumeRowData({
              bootableVolume,
              bootableVolumesData,
              preferencesMap,
              userPreferencesMap,
              volumeListNamespace,
            })}
            selectedBootableVolume={selectedBootableVolume}
          />
        ))}
      </Tbody>
    </Table>
  );
};

export default BootableVolumeTable;
