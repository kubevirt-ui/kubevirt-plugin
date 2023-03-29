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
      availableTemplatesUID: Set<string>;
      availableDatasources: Record<string, V1beta1DataSource>;
      cloneInProgressDatasources: Record<string, V1beta1DataSource>;
    }
  >
> = ({
  obj,
  activeColumnIDs,
  rowData: { availableDatasources, cloneInProgressDatasources, availableTemplatesUID },
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs} className="pf-m-width-30">
        <ResourceLink
          kind={TemplateModel.kind}
          name={obj.metadata.name}
          namespace={obj.metadata.namespace}
          onClick={() =>
            history.push(`/k8s/ns/${obj.metadata.namespace}/templates/${obj.metadata.name}`)
          }
        />

        {isDeprecatedTemplate(obj) && <Label isCompact>{t('Deprecated')}</Label>}
      </TableData>
      <TableData id="namespace" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData id="workload" activeColumnIDs={activeColumnIDs} className="pf-m-width-15">
        {t(getWorkloadProfile(obj))}
      </TableData>
      <TableData id="availability" activeColumnIDs={activeColumnIDs} className="pf-m-width-30">
        <VirtualMachineTemplatesSource
          template={obj}
          availableDatasources={availableDatasources}
          cloneInProgressDatasources={cloneInProgressDatasources}
          availableTemplatesUID={availableTemplatesUID}
        />
      </TableData>
      <TableData id="cpu" activeColumnIDs={activeColumnIDs}>
        {useVirtualMachineTemplatesCPUMemory(obj)}
      </TableData>
      <TableData
        id=""
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <VirtualMachineTemplatesActions template={obj} />
      </TableData>
    </>
  );
};

export default VirtualMachineTemplatesRow;
