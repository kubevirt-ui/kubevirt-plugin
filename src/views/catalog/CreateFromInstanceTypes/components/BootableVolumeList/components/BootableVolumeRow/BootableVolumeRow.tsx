import React, { FC } from 'react';

import { getTemplateOSIcon as getOSIcon } from '@catalog/templatescatalog/utils/os-icons';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1alpha1PersistentVolumeClaim,
  V1alpha2VirtualMachineClusterPreference,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';
import { Text, TextVariants } from '@patternfly/react-core';
import { TableText, Tr, WrapModifier } from '@patternfly/react-table';

import TableData from './TableData';

type BootableVolumeRowProps = {
  bootableVolume: V1beta1DataSource;
  activeColumnIDs: string[];
  rowData: {
    bootableVolumeSelectedState: [
      V1beta1DataSource,
      React.Dispatch<React.SetStateAction<V1beta1DataSource>>,
    ];
    preference: V1alpha2VirtualMachineClusterPreference;
    pvcSource: V1alpha1PersistentVolumeClaim;
  };
};

const BootableVolumeRow: FC<BootableVolumeRowProps> = ({
  bootableVolume,
  activeColumnIDs,
  rowData: {
    bootableVolumeSelectedState: [bootableVolumeSelected, setBootSourceSelected],
    preference,
    pvcSource,
  },
}) => {
  const bootVolumeName = bootableVolume?.metadata?.name;
  const pvcDiskSize = pvcSource?.spec?.resources?.requests?.storage;
  const sizeData = pvcDiskSize && humanizeBinaryBytes(pvcDiskSize);

  return (
    <Tr
      isHoverable
      isSelectable
      isRowSelected={bootableVolumeSelected?.metadata?.name === bootVolumeName}
      onClick={() => setBootSourceSelected(bootableVolume)}
    >
      <TableData activeColumnIDs={activeColumnIDs} id="name" width={20}>
        <img src={getOSIcon(preference)} alt="os-icon" className="vm-catalog-row-icon" />
        <Text component={TextVariants.small}>{bootVolumeName}</Text>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="operating-system" width={20}>
        {preference?.metadata?.annotations?.[ANNOTATIONS.displayName] || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storage-class" width={20}>
        {pvcSource?.spec?.storageClassName || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="size" width={10}>
        {sizeData?.string || NO_DATA_DASH}
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
