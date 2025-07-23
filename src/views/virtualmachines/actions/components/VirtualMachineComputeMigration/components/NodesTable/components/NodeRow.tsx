import React, { FC } from 'react';

import { humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';
import { Checkbox } from '@patternfly/react-core';
import { NodeData } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

import './NodeRow.scss';

type NodeRowProps = RowProps<
  NodeData,
  { handleNodeSelection: (node: string) => void; selectedNode: string }
>;

const NodeRow: FC<NodeRowProps> = ({
  activeColumnIDs,
  obj,
  rowData: { handleNodeSelection, selectedNode },
}) => {
  const { name, status, totalCPU, totalMemory, usedCPU, usedMemory } = obj;
  const { unit: usedMemoryUnits, value: usedMemoryValue } = humanizeBinaryBytes(
    usedMemory,
    'B',
    'GiB',
  );
  const { unit: totalMemoryUnits, value: totalMemoryValue } = humanizeBinaryBytes(
    totalMemory,
    'B',
    'GiB',
  );

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className="node-row-selection-column" id="">
        <Checkbox
          id={`select-${name}`}
          isChecked={selectedNode === name}
          onChange={() => handleNodeSelection(name)}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        {name}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <Status status={status} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="cpu">
        {`${parseFloat(usedCPU)?.toFixed(1)} cores / ${totalCPU} cores`}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="memory">
        {`${usedMemoryValue} ${usedMemoryUnits} / ${totalMemoryValue} ${totalMemoryUnits}`}
      </TableData>
    </>
  );
};

export default NodeRow;
