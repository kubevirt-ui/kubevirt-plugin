import React, { Dispatch, FC, SetStateAction } from 'react';

import { getTemplateOSIcon as getOSIcon } from '@catalog/templatescatalog/utils/os-icons';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
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
  bootableVolume: BootableVolume;
  activeColumnIDs: string[];
  rowData: {
    bootableVolumeSelectedState: [BootableVolume, Dispatch<SetStateAction<BootableVolume>>];
    preference: V1alpha2VirtualMachineClusterPreference;
    pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
  };
};

const BootableVolumeRow: FC<BootableVolumeRowProps> = ({
  bootableVolume,
  activeColumnIDs,
  rowData: {
    bootableVolumeSelectedState: [selectedBootableVolume, setSelectedBootableVolume],
    preference,
    pvcSource,
  },
}) => {
  const { t } = useKubevirtTranslation();
  const bootVolumeName = getName(bootableVolume);
  const sizeData = formatBytes(pvcSource?.spec?.resources?.requests?.storage);

  return (
    <Tr
      isHoverable
      isSelectable
      isRowSelected={getName(selectedBootableVolume) === bootVolumeName}
      onClick={() => setSelectedBootableVolume(bootableVolume)}
    >
      <TableData activeColumnIDs={activeColumnIDs} id="name" width={20}>
        <img src={getOSIcon(preference)} alt="os-icon" className="vm-catalog-row-icon" />
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
