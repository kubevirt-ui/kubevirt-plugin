import React, { FC, MouseEvent } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { InstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { PREFERENCE_DISPLAY_NAME_KEY } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { getDiskSize } from '@catalog/CreateFromInstanceTypes/utils/utils';
import { getTemplateOSIcon, getVolumeNameOSIcon } from '@catalog/templatescatalog/utils/os-icons';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
  V1beta1DataVolume,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import DeprecatedBadge from '@kubevirt-utils/components/badges/DeprecatedBadge/DeprecatedBadge';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { logITFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import { BOOTABLE_VOLUME_SELECTED } from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isDeprecated } from '@kubevirt-utils/resources/bootableresources/helpers';
import { getVolumeSnapshotStorageClass } from '@kubevirt-utils/resources/bootableresources/selectors';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { VirtualMachinePreference } from '@kubevirt-utils/resources/preference/types';
import {
  getAnnotation,
  getName,
  getNamespace,
  isDataImportCronProgressing,
} from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import {
  isDataSourceCloning,
  isDataSourceUploading,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ARCHITECTURE_ID, getArchitecture } from '@kubevirt-utils/utils/architecture';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { Content, ContentVariants, Flex, FlexItem, Label } from '@patternfly/react-core';
import { TableText, Tr, WrapModifier } from '@patternfly/react-table';

import TableData from './TableData';

import '../../BootableVolumeList.scss';

type BootableVolumeRowProps = {
  activeColumnIDs: string[];
  bootableVolume: BootableVolume;
  rowData: {
    bootableVolumeSelectedState: [BootableVolume, InstanceTypeVMStore['onSelectCreatedVolume']];
    dataImportCron: V1beta1DataImportCron;
    dvSource: V1beta1DataVolume;
    favorites: [isFavorite: boolean, updaterFavorites: (val: boolean) => void];
    preference: VirtualMachinePreference;
    pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
    volumeSnapshotSource: VolumeSnapshotKind;
  };
};

const BootableVolumeRow: FC<BootableVolumeRowProps> = ({
  activeColumnIDs,
  bootableVolume,
  rowData: {
    bootableVolumeSelectedState: [selectedBootableVolume, setSelectedBootableVolume],
    dataImportCron,
    dvSource,
    favorites,
    preference,
    pvcSource,
    volumeSnapshotSource,
  },
}) => {
  const { t } = useKubevirtTranslation();
  const bootVolumeName = getName(bootableVolume);
  const bootVolumeNamespace = getNamespace(bootableVolume);
  const sizeData = getHumanizedSize(getDiskSize(dvSource, pvcSource, volumeSnapshotSource)).string;
  const icon = getVolumeNameOSIcon(bootVolumeName) || getTemplateOSIcon(preference);

  const [isFavorite, addOrRemoveFavorite] = favorites;

  const handleOnClick = () => {
    setSelectedBootableVolume(bootableVolume, pvcSource, volumeSnapshotSource, dvSource);
    logITFlowEvent(BOOTABLE_VOLUME_SELECTED, null, {
      selectedBootableVolume: getName(bootableVolume),
    });
  };

  const { volumeListNamespace } = useInstanceTypeVMStore();
  const isCloning =
    isDataImportCronProgressing(dataImportCron) ||
    isDataSourceCloning(bootableVolume as V1beta1DataSource);

  return (
    <Tr
      isRowSelected={
        getName(selectedBootableVolume) === bootVolumeName &&
        getNamespace(selectedBootableVolume) === bootVolumeNamespace
      }
      isClickable
      isSelectable
      onClick={() => handleOnClick()}
    >
      <TableData
        favorites={{
          isFavorited: isFavorite,
          onFavorite: (e: MouseEvent, isFavoring: boolean) => {
            e.stopPropagation();
            addOrRemoveFavorite(isFavoring);
          },
        }}
        activeColumnIDs={activeColumnIDs}
        id="favorites"
        modifier="fitContent"
      />
      <TableData activeColumnIDs={activeColumnIDs} id="name" width={15}>
        <Flex alignItems={{ default: 'alignItemsCenter' }} columnGap={{ default: 'columnGapXs' }}>
          <img alt="os-icon" className="bootable-volume-row-icon" src={icon} />
          <FlexItem>
            <Content component={ContentVariants.small}>{bootVolumeName}</Content>
          </FlexItem>
          {isDeprecated(bootVolumeName) && <DeprecatedBadge />}
          {isCloning && <Label isCompact>{t('Clone in progress')}</Label>}
          {isDataSourceUploading(bootableVolume as V1beta1DataSource) && (
            <Label isCompact>{t('Upload in progress')}</Label>
          )}
        </Flex>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={ARCHITECTURE_ID} width={10}>
        <ArchitectureLabel architecture={getArchitecture(bootableVolume)} />
      </TableData>
      {volumeListNamespace === ALL_PROJECTS && (
        <TableData activeColumnIDs={activeColumnIDs} id="namespace" width={20}>
          {bootVolumeNamespace}
        </TableData>
      )}
      <TableData activeColumnIDs={activeColumnIDs} id="operating-system" width={15}>
        {getAnnotation(preference, PREFERENCE_DISPLAY_NAME_KEY, NO_DATA_DASH)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storage-class" width={15}>
        {getVolumeSnapshotStorageClass(volumeSnapshotSource) ||
          pvcSource?.spec?.storageClassName ||
          NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="size" width={10}>
        {sizeData}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={ANNOTATIONS.description} width={20}>
        <TableText wrapModifier={WrapModifier.truncate}>
          {getAnnotation(bootableVolume, ANNOTATIONS.description, NO_DATA_DASH)}
        </TableText>
      </TableData>
    </Tr>
  );
};

export default BootableVolumeRow;
