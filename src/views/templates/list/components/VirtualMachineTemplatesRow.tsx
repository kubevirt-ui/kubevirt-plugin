import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import { useVirtualMachineTemplatesCPUMemory } from '../hooks/useVirtualMachineTemplatesCPUMemory';

import VirtualMachineTemplatesSource from './VirtualMachineTemplatesSource';

const VirtualMachineTemplatesRow: React.FC<RowProps<V1Template, { kind: string }>> = ({
  obj,
  activeColumnIDs,
  rowData: { kind },
}) => {
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} />
      </TableData>
      <TableData id="namespace" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData id="availability" activeColumnIDs={activeColumnIDs}>
        <VirtualMachineTemplatesSource template={obj} />
      </TableData>
      <TableData id="cpu" activeColumnIDs={activeColumnIDs}>
        {useVirtualMachineTemplatesCPUMemory(obj)}
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        {/* TODO Kebab */}
      </TableData>
    </>
  );
};

export default VirtualMachineTemplatesRow;
