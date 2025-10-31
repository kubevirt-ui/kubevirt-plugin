import React, { FC, useMemo } from 'react';
import DataSourceActions from 'src/views/datasources/actions/DataSourceActions';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import DeprecatedBadge from '@kubevirt-utils/components/badges/DeprecatedBadge/DeprecatedBadge';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
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
import { ARCHITECTURE_ID, getArchitecture } from '@kubevirt-utils/utils/architecture';
import { getCluster } from '@multicluster/helpers/selectors';
import { RowProps, TableData, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { TableText, WrapModifier } from '@patternfly/react-table';
import { FleetResourceLink } from '@stolostron/multicluster-sdk';

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
  const [namespace] = useActiveNamespace();
  const cluster = getCluster(obj);

  const clusterPreferences = useMemo(
    () => preferences.filter((preference) => getCluster(preference) === cluster),
    [preferences, cluster],
  );

  const bootableVolumeName = getName(obj);
  const bootableVolumeNamespace = getNamespace(obj);

  const dataImportCron = getDataImportCronFromDataSource(dataImportCrons, obj as V1beta1DataSource);

  const isCloning =
    isDataSourceCloning(obj as V1beta1DataSource) || isDataImportCronProgressing(dataImportCron);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20" id="name">
        <FleetResourceLink
          className="bootable-volume-row__name-link"
          cluster={cluster}
          groupVersionKind={getBootableVolumeGroupVersionKind(obj)}
          inline
          name={bootableVolumeName}
          namespace={bootableVolumeNamespace}
        />
        {isDeprecated(bootableVolumeName) && <DeprecatedBadge />}
        {obj.kind === DataSourceModel.kind && isCloning && <Label>{t('Clone in progress')}</Label>}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20" id="cluster">
        {getCluster(obj)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-10" id={ARCHITECTURE_ID}>
        <ArchitectureLabel architecture={getArchitecture(obj)} />
      </TableData>
      {namespace === ALL_NAMESPACES_SESSION_KEY && (
        <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20" id="namespace">
          <FleetResourceLink cluster={cluster} kind="Namespace" name={bootableVolumeNamespace} />
        </TableData>
      )}
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15" id="os">
        {getPreferenceReadableOS(obj, clusterPreferences)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15" id="description">
        <TableText wrapModifier={WrapModifier.truncate}>
          {obj?.metadata?.annotations?.[ANNOTATIONS.description] || NO_DATA_DASH}
        </TableText>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15" id="preference">
        {getSourcePreferenceLabelValue(obj) || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        {isBootableVolumePVCKind(obj) ? (
          <BootableVolumesActions preferences={clusterPreferences} source={obj} />
        ) : (
          <DataSourceActions dataSource={obj as V1beta1DataSource} isKebabToggle />
        )}
      </TableData>
    </>
  );
};

export default BootableVolumesRow;
