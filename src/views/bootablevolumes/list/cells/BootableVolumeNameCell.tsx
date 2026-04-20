import React, { FCC, useMemo } from 'react';
import { TFunction } from 'i18next';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import DeprecatedBadge from '@kubevirt-utils/components/badges/DeprecatedBadge/DeprecatedBadge';
import {
  getBootableVolumeGroupVersionKind,
  getDataImportCronFromDataSource,
  isDeprecated,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import {
  getName,
  getNamespace,
  getResourceFromClusterMap,
  isDataImportCronProgressing,
} from '@kubevirt-utils/resources/shared';
import {
  isDataSourceCloning,
  isDataSourceReady,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { Label } from '@patternfly/react-core';

import { BootableResource } from '../../utils/types';
import { BootableVolumeCallbacks } from '../bootableVolumesDefinition';
import { getEffectiveCluster } from '../utils/helpers';

import './BootableVolumeNameCell.scss';

type BootableVolumeNameCellProps = {
  callbacks: BootableVolumeCallbacks;
  row: BootableResource;
  t: TFunction;
};

const BootableVolumeNameCell: FCC<BootableVolumeNameCellProps> = ({ callbacks, row, t }) => {
  const cluster = getEffectiveCluster(row, callbacks);
  const bootableVolumeName = getName(row);
  const bootableVolumeNamespace = getNamespace(row);
  const isDataSource = row.kind === DataSourceModel.kind;

  const isCloning = useMemo(() => {
    if (!isDataSource) return false;

    const dataImportCron = getDataImportCronFromDataSource(
      callbacks.dataImportCrons,
      row as V1beta1DataSource,
    );
    const isProvisioning =
      !isDataSourceReady(row as V1beta1DataSource) &&
      !!getResourceFromClusterMap(
        callbacks.dvSources,
        cluster,
        bootableVolumeNamespace,
        bootableVolumeName,
      );

    return (
      isDataSourceCloning(row as V1beta1DataSource) ||
      isDataImportCronProgressing(dataImportCron) ||
      isProvisioning
    );
  }, [isDataSource, callbacks, row, cluster, bootableVolumeNamespace, bootableVolumeName]);

  return (
    <>
      <MulticlusterResourceLink
        className="bootable-volume-row__name-link"
        cluster={cluster}
        groupVersionKind={getBootableVolumeGroupVersionKind(row)}
        inline
        name={bootableVolumeName}
        namespace={bootableVolumeNamespace}
      />
      {isDeprecated(bootableVolumeName) && <DeprecatedBadge />}
      {isDataSource && isCloning && <Label>{t('Clone in progress')}</Label>}
    </>
  );
};

export default BootableVolumeNameCell;
