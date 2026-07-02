import React, { FC } from 'react';

import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import { PREFERENCE_DISPLAY_NAME_KEY } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import {
  getDiskSize,
  getPVCStorageClassName,
  getVolumeSnapshotStorageClass,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getAnnotation, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ARCHITECTURE_ID, getArchitecture } from '@kubevirt-utils/utils/architecture';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { TableText, Tr, WrapModifier } from '@patternfly/react-table';
import {
  getTemplateOSIcon,
  getVolumeNameOSIcon,
} from '@virtualmachines/creation-wizard-new/utils/os-icons/os-icons';
import { ApplySelectedBootableVolumeToForm } from '@virtualmachines/creation-wizard-new/utils/types';

import { BootableVolumeRowData } from '../../../../types';

import BootableVolumeRowNameCell from './components/BootableVolumeRowNameCell';
import TableData from './TableData';

import '../../BootableVolumeList.scss';

type BootableVolumeRowProps = {
  activeColumnIDs: string[];
  bootableVolume: BootableVolume;
  onSelectBootableVolume: (
    args: Omit<ApplySelectedBootableVolumeToForm, 'getValues' | 'setValue'>,
  ) => void;
  rowData: BootableVolumeRowData;
  selectedBootableVolume?: BootableVolume;
};

const BootableVolumeRow: FC<BootableVolumeRowProps> = ({
  activeColumnIDs,
  bootableVolume,
  onSelectBootableVolume,
  rowData,
  selectedBootableVolume,
}) => {
  const bootVolumeName = getName(bootableVolume);
  const bootVolumeNamespace = getNamespace(bootableVolume);
  const {
    dataImportCron,
    dvSource,
    preference,
    pvcSource,
    volumeListNamespace,
    volumeSnapshotSource,
  } = rowData;

  const isSelected =
    getName(selectedBootableVolume) === bootVolumeName &&
    getNamespace(selectedBootableVolume) === bootVolumeNamespace;

  const handleClick = () => {
    onSelectBootableVolume({
      dvSource,
      pvcSource,
      selectedVolume: bootableVolume,
      volumeSnapshotSource,
    });
  };

  const sizeData = getHumanizedSize(getDiskSize(dvSource, pvcSource, volumeSnapshotSource)).string;
  const icon = getVolumeNameOSIcon(bootVolumeName) || getTemplateOSIcon(preference);

  return (
    <Tr isClickable isRowSelected={isSelected} isSelectable onClick={handleClick}>
      <BootableVolumeRowNameCell
        activeColumnIDs={activeColumnIDs}
        bootableVolume={bootableVolume}
        bootVolumeName={bootVolumeName}
        dataImportCron={dataImportCron}
        icon={icon}
      />
      <TableData activeColumnIDs={activeColumnIDs} id={ARCHITECTURE_ID} width={10}>
        <ArchitectureLabel architecture={getArchitecture(bootableVolume)} />
      </TableData>
      {volumeListNamespace === ALL_PROJECTS && (
        <TableData activeColumnIDs={activeColumnIDs} id="namespace" width={15}>
          {bootVolumeNamespace}
        </TableData>
      )}
      <TableData activeColumnIDs={activeColumnIDs} id="operating-system" width={15}>
        {getAnnotation(preference, PREFERENCE_DISPLAY_NAME_KEY, NO_DATA_DASH)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storage-class" width={15}>
        {getVolumeSnapshotStorageClass(volumeSnapshotSource) ||
          getPVCStorageClassName(pvcSource) ||
          NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="size" width={10}>
        {sizeData}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={ANNOTATIONS.description} width={15}>
        <TableText wrapModifier={WrapModifier.truncate}>
          {getAnnotation(bootableVolume, ANNOTATIONS.description, NO_DATA_DASH)}
        </TableText>
      </TableData>
    </Tr>
  );
};

export default BootableVolumeRow;
