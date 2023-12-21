import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isDeprecatedTemplate } from '@kubevirt-utils/resources/template';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

import VirtualMachineTemplatesActions from '../../actions/VirtualMachineTemplatesActions';
import { getWorkloadProfile } from '../../utils/selectors';
import { useVirtualMachineTemplatesCPUMemory } from '../hooks/useVirtualMachineTemplatesCPUMemory';

import VirtualMachineTemplatesSource from './VirtualMachineTemplatesSource/VirtualMachineTemplatesSource';

const VirtualMachineTemplatesRow: React.FC<
  RowProps<
    V1Template,
    {
      availableDatasources: Record<string, V1beta1DataSource>;
      availableTemplatesUID: Set<string>;
      cloneInProgressDatasources: Record<string, V1beta1DataSource>;
    }
  >
> = ({
  activeColumnIDs,
  obj,
  rowData: { availableDatasources, availableTemplatesUID, cloneInProgressDatasources },
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-30" id="name">
        <ResourceLink
          onClick={() =>
            history.push(`/k8s/ns/${obj.metadata.namespace}/templates/${obj.metadata.name}`)
          }
          kind={TemplateModel.kind}
          name={obj.metadata.name}
          namespace={obj.metadata.namespace}
        />

        {isDeprecatedTemplate(obj) && <Label isCompact>{t('Deprecated')}</Label>}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="namespace">
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15" id="workload">
        {t(getWorkloadProfile(obj))}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-30" id="availability">
        <VirtualMachineTemplatesSource
          availableDatasources={availableDatasources}
          availableTemplatesUID={availableTemplatesUID}
          cloneInProgressDatasources={cloneInProgressDatasources}
          template={obj}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="cpu">
        {useVirtualMachineTemplatesCPUMemory(obj)}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-v5-c-table__action"
        id=""
      >
        <VirtualMachineTemplatesActions template={obj} />
      </TableData>
    </>
  );
};

export default VirtualMachineTemplatesRow;
