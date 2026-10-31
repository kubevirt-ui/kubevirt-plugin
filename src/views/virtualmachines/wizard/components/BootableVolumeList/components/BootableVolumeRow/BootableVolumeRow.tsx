import { type FC } from 'react';

import { PREFERENCE_DISPLAY_NAME_KEY } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getDiskSize,
  getPVCStorageClassName,
  getVolumeSnapshotStorageClass,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { getAnnotation, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ARCHITECTURE_ID } from '@kubevirt-utils/utils/architecture';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { Tooltip } from '@patternfly/react-core';
import { TableText, Tr, WrapModifier } from '@patternfly/react-table';
import { isSameTableRow } from '@virtualmachines/wizard/components/BootableVolumeList/utils/utils';
import { getGuestOperatingSystemDisplayName } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/hooks/usePreferenceSelectOptions/utils/utils';
import { getBootableVolumeOSIcon } from '@virtualmachines/wizard/utils/os-icons/os-icons';
import {
  type BootVolumeTableRow,
  type OnSelectBootableVolume,
} from '@virtualmachines/wizard/utils/types';

import { type BootableVolumeRowData } from '../../types';
import BootableVolumeRowNameCell from './components/BootableVolumeRowNameCell';
import TableData from './TableData';

import '../../BootableVolumeList.scss';

type BootableVolumeRowProps = {
  activeColumnIDs: string[];
  onSelectBootableVolume: OnSelectBootableVolume;
  rowData: BootableVolumeRowData;
  selectedTableRow?: BootVolumeTableRow;
  tableRow: BootVolumeTableRow;
};

const BootableVolumeRow: FC<BootableVolumeRowProps> = ({
  activeColumnIDs,
  onSelectBootableVolume,
  rowData,
  selectedTableRow,
  tableRow,
}) => {
  const { t } = useKubevirtTranslation();
  const { preferenceVariant, variant, volume } = tableRow;
  const bootVolumeName = getName(volume);
  const bootVolumeNamespace = getNamespace(volume);
  const {
    dataImportCron,
    dvSource,
    preference,
    pvcSource,
    volumeListNamespace,
    volumeSnapshotSource,
  } = rowData;

  const isSelected = isSameTableRow(selectedTableRow, tableRow);

  const handleClick = (): void => {
    onSelectBootableVolume({
      dvSource,
      preferenceVariant,
      pvcSource,
      selectedVolume: volume,
      volumeSnapshotSource,
    });
  };

  const sizeData = getHumanizedSize(getDiskSize(dvSource, pvcSource, volumeSnapshotSource)).string;
  const icon = getBootableVolumeOSIcon(preference, bootVolumeName);
  const description = getAnnotation(volume, ANNOTATIONS.description, NO_DATA_DASH);
  const preferenceDisplayName = getAnnotation(
    preference,
    PREFERENCE_DISPLAY_NAME_KEY,
    NO_DATA_DASH,
  );
  const operatingSystem = getGuestOperatingSystemDisplayName(preferenceDisplayName);

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
        bootableVolume={volume}
        bootVolumeName={bootVolumeName}
        dataImportCron={dataImportCron}
        icon={icon}
      />
      <TableData
        activeColumnIDs={activeColumnIDs}
        dataLabel={t('Variant')}
        id={ARCHITECTURE_ID}
        width={10}
      >
        {variant === 'default' ? t('Default') : variant}
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
        {operatingSystem}
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
