import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
  const { t } = useKubevirtTranslation();
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

  const usedCPUString = `${parseFloat(usedCPU)?.toFixed(1)} cores / ${totalCPU} cores`;
  const usedMemoryString = `${usedMemoryValue} ${usedMemoryUnits} / ${totalMemoryValue} ${totalMemoryUnits}`;

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
        {totalCPU ? usedCPUString : t('N/A')}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="memory">
        {totalMemory ? usedMemoryString : t('N/A')}
      </TableData>
    </>
  );
};

export default NodeRow;
