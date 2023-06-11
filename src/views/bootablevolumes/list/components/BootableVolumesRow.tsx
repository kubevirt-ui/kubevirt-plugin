import React, { FC } from 'react';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getBootableVolumeGroupVersionKind } from '@kubevirt-utils/resources/bootableresources/helpers';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { isDataSourceCloning } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { TableText, WrapModifier } from '@patternfly/react-table';

import BootableVolumesActions from '../../actions/BootableVolumesActions';
import { BootableResource } from '../../utils/types';
import { getPreferenceReadableOS, getSourcePreferenceLabelValue } from '../../utils/utils';

const BootableVolumesRow: FC<
  RowProps<
    BootableResource,
    {
      preferences: V1alpha2VirtualMachineClusterPreference[];
    }
  >
> = ({ activeColumnIDs, obj, rowData: { preferences } }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20" id="name">
        <ResourceLink
          groupVersionKind={getBootableVolumeGroupVersionKind(obj)}
          inline
          name={obj?.metadata?.name}
          namespace={obj?.metadata?.namespace}
        />
        {obj.kind === DataSourceModel.kind && isDataSourceCloning(obj as V1beta1DataSource) && (
          <Label>{t('Clone in progress')}</Label>
        )}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20" id="namespace">
        <ResourceLink kind="Namespace" name={obj?.metadata?.namespace} />
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
        className="dropdown-kebab-pf pf-c-table__action"
        id=""
      >
        <BootableVolumesActions preferences={preferences} source={obj} />
      </TableData>
    </>
  );
};

export default BootableVolumesRow;
