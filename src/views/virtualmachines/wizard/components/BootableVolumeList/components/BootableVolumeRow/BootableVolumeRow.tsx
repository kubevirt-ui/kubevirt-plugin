import React, { type FC } from 'react';

import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import { PREFERENCE_DISPLAY_NAME_KEY } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getDiskSize,
  getPVCStorageClassName,
  getVolumeSnapshotStorageClass,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getAnnotation, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ARCHITECTURE_ID, getArchitecture } from '@kubevirt-utils/utils/architecture';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { Tooltip } from '@patternfly/react-core';
import { TableText, Tr, WrapModifier } from '@patternfly/react-table';
import {
  getTemplateOSIcon,
  getVolumeNameOSIcon,
} from '@virtualmachines/wizard/utils/os-icons/os-icons';
import { type OnSelectBootableVolume } from '@virtualmachines/wizard/utils/types';

import { type BootableVolumeRowData } from '../../types';
import BootableVolumeRowNameCell from './components/BootableVolumeRowNameCell';
import TableData from './TableData';

import '../../BootableVolumeList.scss';

type BootableVolumeRowProps = {
  activeColumnIDs: string[];
  bootableVolume: BootableVolume;
  onSelectBootableVolume: OnSelectBootableVolume;
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
  const { t } = useKubevirtTranslation();
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

  const handleClick = (): void => {
    onSelectBootableVolume({
      dvSource,
      pvcSource,
      selectedVolume: bootableVolume,
      volumeSnapshotSource,
    });
  };

  const sizeData = getHumanizedSize(getDiskSize(dvSource, pvcSource, volumeSnapshotSource)).string;
  const icon = getVolumeNameOSIcon(bootVolumeName) || getTemplateOSIcon(preference);
  const description = getAnnotation(bootableVolume, ANNOTATIONS.description, NO_DATA_DASH);

  return (
    <Tr
      aria-label={t('Select boot source {{name}}', { name: bootVolumeName })}
      isClickable
      isRowSelected={isSelected}
      isSelectable
      onRowClick={handleClick}
    >
      <BootableVolumeRowNameCell
        activeColumnIDs={activeColumnIDs}
        bootableVolume={bootableVolume}
        bootVolumeName={bootVolumeName}
        dataImportCron={dataImportCron}
        icon={icon}
      />
      <TableData
        activeColumnIDs={activeColumnIDs}
        dataLabel={t('Architecture')}
        id={ARCHITECTURE_ID}
        width={10}
      >
        <ArchitectureLabel architecture={getArchitecture(bootableVolume)} />
      </TableData>
      {volumeListNamespace === ALL_PROJECTS && (
        <TableData
          activeColumnIDs={activeColumnIDs}
          dataLabel={t('Namespace')}
          id="namespace"
          width={15}
        >
          {bootVolumeNamespace}
        </TableData>
      )}
      <TableData
        activeColumnIDs={activeColumnIDs}
        dataLabel={t('Operating system')}
        id="operating-system"
        width={15}
      >
        {getAnnotation(preference, PREFERENCE_DISPLAY_NAME_KEY, NO_DATA_DASH)}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        dataLabel={t('Storage class')}
        id="storage-class"
        width={15}
      >
        {getVolumeSnapshotStorageClass(volumeSnapshotSource) ??
          getPVCStorageClassName(pvcSource) ??
          NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} dataLabel={t('Size')} id="size" width={10}>
        {sizeData}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        dataLabel={t('Description')}
        id={ANNOTATIONS.description}
        width={15}
      >
        <Tooltip content={description}>
          <TableText tabIndex={0} wrapModifier={WrapModifier.truncate}>
            {description}
          </TableText>
        </Tooltip>
      </TableData>
    </Tr>
  );
};

export default BootableVolumeRow;
