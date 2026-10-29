import { type FC } from 'react';

import {
  type V1beta1VirtualMachineClusterPreference,
  type V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type NamespacedResourceMap, type ResourceMap } from '@kubevirt-utils/resources/shared';
import { Table, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { type ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import { getBootableVolumeRowData } from '@virtualmachines/wizard/components/BootableVolumeList/utils/getBootableVolumeRowData';
import {
  type BootVolumeTableRow,
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
  selectedTableRow?: BootVolumeTableRow;
  sortedPaginatedData: BootVolumeTableRow[];
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
  selectedTableRow,
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
        {sortedPaginatedData?.map?.((tableRow) => (
          <BootableVolumeRow
            activeColumnIDs={activeColumns.map((col) => col.id)}
            key={tableRow.rowKey}
            onSelectBootableVolume={onSelectBootableVolume}
            rowData={getBootableVolumeRowData({
              bootableVolume: tableRow.volume,
              bootableVolumesData,
              preferencesMap,
              userPreferencesMap,
              volumeListNamespace,
            })}
            selectedTableRow={selectedTableRow}
            tableRow={tableRow}
          />
        ))}
      </Tbody>
    </Table>
  );
};

export default BootableVolumeTable;
