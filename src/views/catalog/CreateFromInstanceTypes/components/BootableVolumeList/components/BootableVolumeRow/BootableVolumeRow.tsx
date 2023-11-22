import React, { FC } from 'react';

import { getTemplateOSIcon, getVolumeNameOSIcon } from '@catalog/templatescatalog/utils/os-icons';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import {
  isDataSourceCloning,
  isDataSourceUploading,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { Label, Text, TextVariants } from '@patternfly/react-core';
import { TableText, Tr, WrapModifier } from '@patternfly/react-table';

import TableData from './TableData';

type BootableVolumeRowProps = {
  activeColumnIDs: string[];
  bootableVolume: BootableVolume;
  rowData: {
    bootableVolumeSelectedState: [
      BootableVolume,
      (selectedVolume: BootableVolume, pvcSource: IoK8sApiCoreV1PersistentVolumeClaim) => void,
    ];
    preference: V1beta1VirtualMachineClusterPreference;
    pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
  };
};

const BootableVolumeRow: FC<BootableVolumeRowProps> = ({
  activeColumnIDs,
  bootableVolume,
  rowData: {
    bootableVolumeSelectedState: [selectedBootableVolume, setSelectedBootableVolume],
    preference,
    pvcSource,
  },
}) => {
  const { t } = useKubevirtTranslation();
  const bootVolumeName = getName(bootableVolume);
  const sizeData = formatBytes(pvcSource?.spec?.resources?.requests?.storage);
  const icon = getVolumeNameOSIcon(bootVolumeName) || getTemplateOSIcon(preference);

  return (
    <Tr
      isHoverable
      isRowSelected={getName(selectedBootableVolume) === bootVolumeName}
      isSelectable
      onClick={() => setSelectedBootableVolume(bootableVolume, pvcSource)}
    >
      <TableData activeColumnIDs={activeColumnIDs} id="name" width={20}>
        <img alt="os-icon" className="vm-catalog-row-icon" src={icon} />
        <Text component={TextVariants.small}>{bootVolumeName}</Text>
        {isDataSourceCloning(bootableVolume as V1beta1DataSource) && (
          <Label className="vm-catalog-row-label">{t('Clone in progress')}</Label>
        )}
        {isDataSourceUploading(bootableVolume as V1beta1DataSource) && (
          <Label className="vm-catalog-row-label">{t('Upload in progress')}</Label>
        )}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="operating-system" width={20}>
        {preference?.metadata?.annotations?.[ANNOTATIONS.displayName] || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storage-class" width={20}>
        {pvcSource?.spec?.storageClassName || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="size" width={10}>
        {sizeData || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id={ANNOTATIONS.description} width={30}>
        <TableText wrapModifier={WrapModifier.truncate}>
          {bootableVolume?.metadata?.annotations?.[ANNOTATIONS.description] || NO_DATA_DASH}
        </TableText>
      </TableData>
    </Tr>
  );
};

export default BootableVolumeRow;
