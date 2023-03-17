import React, { FC } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isDataSourceCloning } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  K8sGroupVersionKind,
  ResourceLink,
  RowProps,
  TableData,
  Timestamp,
} from '@openshift-console/dynamic-plugin-sdk';
import { Label, Split, SplitItem } from '@patternfly/react-core';

import BootableVolumesActions from '../../actions/BootableVolumesActions';
import { getDataSourcePreferenceLabelValue, getPreferenceReadableOS } from '../../utils/utils';

const BootableVolumesRow: FC<
  RowProps<
    V1beta1DataSource,
    {
      groupVersionKind: K8sGroupVersionKind;
      preferences: V1alpha2VirtualMachineClusterPreference[];
      instanceTypesNames: string[];
    }
  >
> = ({ obj, activeColumnIDs, rowData: { groupVersionKind, preferences, instanceTypesNames } }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs} className="pf-m-width-15">
        <Split hasGutter>
          <SplitItem>
            <ResourceLink groupVersionKind={groupVersionKind} name={obj?.metadata?.name} />
          </SplitItem>
          {isDataSourceCloning(obj) && (
            <SplitItem>
              <Label>{t('Clone in progress')}</Label>
            </SplitItem>
          )}
        </Split>
      </TableData>
      <TableData id="os" activeColumnIDs={activeColumnIDs} className="pf-m-width-15">
        {getPreferenceReadableOS(obj, preferences)}
      </TableData>
      <TableData id="description" activeColumnIDs={activeColumnIDs} className="pf-m-width-15">
        {obj?.metadata?.annotations?.description || NO_DATA_DASH}
      </TableData>
      <TableData id="preference" activeColumnIDs={activeColumnIDs} className="pf-m-width-15">
        {getDataSourcePreferenceLabelValue(obj)}
      </TableData>
      <TableData id="namespace" activeColumnIDs={activeColumnIDs} className="pf-m-width-20">
        <ResourceLink kind="Namespace" name={obj?.metadata?.namespace} />
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={obj?.metadata?.creationTimestamp} />
      </TableData>
      <TableData
        id=""
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <BootableVolumesActions
          dataSource={obj}
          preferences={preferences}
          instanceTypesNames={instanceTypesNames}
        />
      </TableData>
    </>
  );
};

export default BootableVolumesRow;
