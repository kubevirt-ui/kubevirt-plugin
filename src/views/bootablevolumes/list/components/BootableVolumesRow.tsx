import React, { FC } from 'react';

import { getBootableVolumeGroupVersionKind } from '@catalog/CreateFromInstanceTypes/utils/utils';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
> = ({ obj, activeColumnIDs, rowData: { preferences } }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs} className="pf-m-width-20">
        <ResourceLink
          groupVersionKind={getBootableVolumeGroupVersionKind(obj)}
          name={obj?.metadata?.name}
          namespace={obj?.metadata?.namespace}
          inline
        />
        {obj.kind === DataSourceModel.kind && isDataSourceCloning(obj as V1beta1DataSource) && (
          <Label>{t('Clone in progress')}</Label>
        )}
      </TableData>
      <TableData id="namespace" activeColumnIDs={activeColumnIDs} className="pf-m-width-20">
        <ResourceLink kind="Namespace" name={obj?.metadata?.namespace} />
      </TableData>
      <TableData id="os" activeColumnIDs={activeColumnIDs} className="pf-m-width-15">
        {getPreferenceReadableOS(obj, preferences)}
      </TableData>
      <TableData id="description" activeColumnIDs={activeColumnIDs} className="pf-m-width-15">
        <TableText wrapModifier={WrapModifier.truncate}>
          {obj?.metadata?.annotations?.[ANNOTATIONS.description] || NO_DATA_DASH}
        </TableText>
      </TableData>
      <TableData id="preference" activeColumnIDs={activeColumnIDs} className="pf-m-width-15">
        {getSourcePreferenceLabelValue(obj)}
      </TableData>
      <TableData
        id=""
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <BootableVolumesActions source={obj} preferences={preferences} />
      </TableData>
    </>
  );
};

export default BootableVolumesRow;
