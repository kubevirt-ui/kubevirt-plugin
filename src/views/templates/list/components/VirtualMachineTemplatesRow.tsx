import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import VirtualMachineTemplatesActions from '../../actions/VirtualMachineTemplatesActions';
import { useVirtualMachineTemplatesCPUMemory } from '../hooks/useVirtualMachineTemplatesCPUMemory';
import useWorkloadProfile from '../hooks/useWorkloadProfile';

import VirtualMachineTemplatesSource from './VirtualMachineTemplatesSource';

const VirtualMachineTemplatesRow: React.FC<
  RowProps<V1Template, { availableTemplatesUID: Set<string> }>
> = ({ obj, activeColumnIDs, rowData: { availableTemplatesUID } }) => {
  const history = useHistory();

  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          kind={TemplateModel.kind}
          name={obj.metadata.name}
          namespace={obj.metadata.namespace}
          onClick={() =>
            history.push(`/k8s/ns/${obj.metadata.namespace}/templates/${obj.metadata.name}`)
          }
        />
      </TableData>
      <TableData id="namespace" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData id="workload" activeColumnIDs={activeColumnIDs}>
        {useWorkloadProfile(obj)}
      </TableData>
      <TableData id="availability" activeColumnIDs={activeColumnIDs}>
        <VirtualMachineTemplatesSource
          isBootSourceAvailable={availableTemplatesUID.has(obj.metadata.uid)}
        />
      </TableData>
      <TableData id="cpu" activeColumnIDs={activeColumnIDs}>
        {useVirtualMachineTemplatesCPUMemory(obj)}
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <VirtualMachineTemplatesActions template={obj} />
      </TableData>
    </>
  );
};

export default VirtualMachineTemplatesRow;
