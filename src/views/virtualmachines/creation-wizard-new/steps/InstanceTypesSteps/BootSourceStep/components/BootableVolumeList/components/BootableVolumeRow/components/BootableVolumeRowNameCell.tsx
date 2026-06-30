import React, { FC, useMemo } from 'react';

import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import DeprecatedBadge from '@kubevirt-utils/components/badges/DeprecatedBadge/DeprecatedBadge';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isDeprecated } from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { isDataImportCronProgressing } from '@kubevirt-utils/resources/shared';
import {
  isDataSourceCloning,
  isDataSourceUploading,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { Content, ContentVariants, Flex, FlexItem, Label } from '@patternfly/react-core';

import TableData from '../TableData';

import '../../../BootableVolumeList.scss';

type BootableVolumeRowNameCellProps = {
  activeColumnIDs: string[];
  bootableVolume: BootableVolume;
  bootVolumeName: string;
  dataImportCron: V1beta1DataImportCron;
  icon: string;
};

const BootableVolumeRowNameCell: FC<BootableVolumeRowNameCellProps> = ({
  activeColumnIDs,
  bootableVolume,
  bootVolumeName,
  dataImportCron,
  icon,
}) => {
  const { t } = useKubevirtTranslation();

  const isCloning = useMemo(
    () =>
      isDataImportCronProgressing(dataImportCron) ||
      isDataSourceCloning(bootableVolume as V1beta1DataSource),
    [dataImportCron, bootableVolume],
  );

  return (
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
  );
};

export default BootableVolumeRowNameCell;
