import React, { FC, useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { BOOTABLE_VOLUME_SELECTED, logITFlowEvent } from '@kubevirt-utils/extensions/telemetry';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName, NamespacedResourceMap, ResourceMap } from '@kubevirt-utils/resources/shared';
import { Table, TableVariant, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import { getBootableVolumeRowData } from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/getBootableVolumeRowData';
import {
  ApplySelectedBootableVolumeToForm,
  UseBootableVolumesValues,
} from '@virtualmachines/creation-wizard-new/utils/types';
import { applySelectedBootableVolumeToForm } from '@virtualmachines/creation-wizard-new/utils/utils';

import { TableColumnWithOptionalIndex } from '../../../../types';
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
        {sortedPaginatedData?.map?.((bootableVolume, index) => (
          <BootableVolumeRow
            rowData={getBootableVolumeRowData({
              bootableVolume,
              bootableVolumesData,
              preferencesMap,
              userPreferencesMap,
              volumeListNamespace,
            })}
            activeColumnIDs={activeColumns?.map((col) => col?.id)}
            bootableVolume={bootableVolume}
            key={`${getName(bootableVolume)}-${index}`}
            onSelectBootableVolume={onSelectBootableVolume}
            selectedBootableVolume={selectedBootableVolume}
          />
        ))}
      </Tbody>
    </Table>
  );
};

export default BootableVolumeTable;
