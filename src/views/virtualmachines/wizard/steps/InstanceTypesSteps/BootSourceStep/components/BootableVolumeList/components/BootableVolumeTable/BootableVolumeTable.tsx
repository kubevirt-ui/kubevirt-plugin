import React, { type FC, useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import {
  type V1beta1VirtualMachineClusterPreference,
  type V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { BOOTABLE_VOLUME_SELECTED, logITFlowEvent } from '@kubevirt-utils/extensions/telemetry';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  getName,
  getUID,
  type NamespacedResourceMap,
  type ResourceMap,
} from '@kubevirt-utils/resources/shared';
import { Table, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { type ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { getBootableVolumeRowData } from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/getBootableVolumeRowData';
import {
  type ApplySelectedBootableVolumeToForm,
  type UseBootableVolumesValues,
} from '@virtualmachines/wizard/utils/types';
import { applySelectedBootableVolumeToForm } from '@virtualmachines/wizard/utils/utils';

import { type TableColumnWithOptionalIndex } from '../../../../types';
import BootableVolumeRow from '../BootableVolumeRow/BootableVolumeRow';

type BootableVolumeTableProps = {
  activeColumns: TableColumnWithOptionalIndex<BootableVolume>[];
  bootableVolumesData: UseBootableVolumesValues;
  getSortType: (columnIndex: number) => ThSortType;
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>;
  sortedPaginatedData: BootableVolume[];
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>;
  volumeListNamespace: string;
};

const BootableVolumeTable: FC<BootableVolumeTableProps> = ({
  activeColumns,
  bootableVolumesData,
  getSortType,
  preferencesMap,
  sortedPaginatedData,
  userPreferencesMap,
  volumeListNamespace,
}) => {
  const { control, getValues, setValue } = useVMWizard();

  const selectedBootableVolume = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_BOOTABLE_VOLUME,
  });

  const onSelectBootableVolume = useCallback(
    (args: ApplySelectedBootableVolumeToForm) => {
      applySelectedBootableVolumeToForm({
        ...args,
        getValues,
        setValue,
      });
      logITFlowEvent(BOOTABLE_VOLUME_SELECTED, null, {
        selectedBootableVolume: getName(args.selectedVolume),
      });
    },
    [getValues, setValue],
  );

  return (
    <Table className="BootableVolumeList-table" variant={TableVariant.compact}>
      <Thead>
        <Tr>
          {activeColumns.map((col) => (
            <Th id={col?.id} key={col?.id} sort={getSortType(col.columnIndex)}>
              {col?.title}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {sortedPaginatedData?.map?.((bootableVolume) => (
          <BootableVolumeRow
            activeColumnIDs={activeColumns?.map((col) => col?.id)}
            bootableVolume={bootableVolume}
            key={getUID(bootableVolume)}
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
