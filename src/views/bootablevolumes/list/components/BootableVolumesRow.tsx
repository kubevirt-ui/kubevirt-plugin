import React, { FC } from 'react';
import DataSourceActions from 'src/views/datasources/actions/DataSourceActions';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DeprecatedBadge from '@kubevirt-utils/components/badges/DeprecatedBadge/DeprecatedBadge';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getBootableVolumeGroupVersionKind,
  getDataImportCronFromDataSource,
  isBootableVolumePVCKind,
  isDeprecated,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import {
  getName,
  getNamespace,
  isDataImportCronProgressing,
} from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { isDataSourceCloning } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { TableText, WrapModifier } from '@patternfly/react-table';

import BootableVolumesActions from '../../actions/BootableVolumesActions';
import { BootableResource } from '../../utils/types';
import { getPreferenceReadableOS, getSourcePreferenceLabelValue } from '../../utils/utils';

import './BootableVolumesRow.scss';

const BootableVolumesRow: FC<
  RowProps<
    BootableResource,
    {
      dataImportCrons: V1beta1DataImportCron[];
      preferences: V1beta1VirtualMachineClusterPreference[];
    }
  >
> = ({ activeColumnIDs, obj, rowData: { dataImportCrons, preferences } }) => {
  const { t } = useKubevirtTranslation();

  const bootableVolumeName = getName(obj);
  const bootableVolumeNamespace = getNamespace(obj);

  const dataImportCron = getDataImportCronFromDataSource(dataImportCrons, obj as V1beta1DataSource);

  const isCloning =
    isDataSourceCloning(obj as V1beta1DataSource) || isDataImportCronProgressing(dataImportCron);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20" id="name">
        <ResourceLink
          className="bootable-volume-row__name-link"
          groupVersionKind={getBootableVolumeGroupVersionKind(obj)}
          inline
          name={bootableVolumeName}
          namespace={bootableVolumeNamespace}
        />
        {isDeprecated(bootableVolumeName) && <DeprecatedBadge />}
        {obj.kind === DataSourceModel.kind && isCloning && <Label>{t('Clone in progress')}</Label>}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20" id="namespace">
        <ResourceLink kind="Namespace" name={bootableVolumeNamespace} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15" id="os">
        {getPreferenceReadableOS(obj, preferences)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15" id="description">
        <TableText wrapModifier={WrapModifier.truncate}>
          {obj?.metadata?.annotations?.[ANNOTATIONS.description] || NO_DATA_DASH}
        </TableText>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15" id="preference">
        {getSourcePreferenceLabelValue(obj)}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-v5-c-table__action"
        id=""
      >
        {isBootableVolumePVCKind(obj) ? (
          <BootableVolumesActions preferences={preferences} source={obj} />
        ) : (
          <DataSourceActions dataSource={obj as V1beta1DataSource} isKebabToggle />
        )}
      </TableData>
    </>
  );
};

export default BootableVolumesRow;
