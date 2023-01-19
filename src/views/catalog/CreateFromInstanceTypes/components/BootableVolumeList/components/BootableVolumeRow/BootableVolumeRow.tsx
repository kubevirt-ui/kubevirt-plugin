import React, { FC } from 'react';

import { getTemplateOSIcon as getOSIcon } from '@catalog/templatescatalog/utils/os-icons';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { Text, TextVariants } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';

type BootableVolumeRowProps = {
  bootableVolume: V1beta1DataSource;
  rowData: {
    bootableVolumeSelectedState: [
      V1beta1DataSource,
      React.Dispatch<React.SetStateAction<V1beta1DataSource>>,
    ];
    preference: V1alpha2VirtualMachineClusterPreference;
  };
};

const BootableVolumeRow: FC<BootableVolumeRowProps> = ({
  bootableVolume,
  rowData: {
    bootableVolumeSelectedState: [bootableVolumeSelected, setBootSourceSelected],
    preference,
  },
}) => {
  const bootVolumeName = bootableVolume?.metadata?.name;
  return (
    <Tr
      isHoverable
      isSelectable
      isRowSelected={bootableVolumeSelected?.metadata?.name === bootVolumeName}
      onClick={() => setBootSourceSelected(bootableVolume)}
    >
      <Td id="volume-name">
        <img src={getOSIcon(preference)} alt="os-icon" className="vm-catalog-row-icon" />
        <Text component={TextVariants.a}>{bootVolumeName}</Text>
      </Td>
      <Td id="operating-system">{preference?.metadata?.annotations?.[ANNOTATIONS.displayName]}</Td>
      <Td id={ANNOTATIONS.description}>
        {bootableVolume?.metadata?.annotations?.[ANNOTATIONS.description]}
      </Td>
    </Tr>
  );
};

export default BootableVolumeRow;
