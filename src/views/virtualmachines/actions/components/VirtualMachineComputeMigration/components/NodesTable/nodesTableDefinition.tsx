import React, { FC, ReactNode } from 'react';
import { TFunction } from 'react-i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';
import { Checkbox } from '@patternfly/react-core';

import { NodeData } from '../../utils/types';

import './components/NodeRow.scss';

export type NodesTableCallbacks = {
  handleNodeSelection: (node: string) => void;
  selectedNode: string;
};

type SelectionCellProps = {
  callbacks: NodesTableCallbacks;
  row: NodeData;
};

const SelectionCell: FC<SelectionCellProps> = ({ callbacks, row }) => {
  const { t } = useKubevirtTranslation();
  const { handleNodeSelection, selectedNode } = callbacks;
  return (
    <Checkbox
      aria-label={t('Select node {{name}}', { name: row.name })}
      id={`select-${row.name}`}
      isChecked={selectedNode === row.name}
      onChange={() => handleNodeSelection(row.name)}
    />
  );
};

type CPUCellProps = {
  row: NodeData;
};

const CPUCell: FC<CPUCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const { totalCPU, usedCPU } = row;

  if (!totalCPU) {
    return <span data-test-id={`node-cpu-${row.name}`}>{t('N/A')}</span>;
  }

  const usedCPUString = `${parseFloat(usedCPU)?.toFixed(1)} cores / ${totalCPU} cores`;
  return <span data-test-id={`node-cpu-${row.name}`}>{usedCPUString}</span>;
};

type MemoryCellProps = {
  row: NodeData;
};

const MemoryCell: FC<MemoryCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const { totalMemory, usedMemory } = row;

  if (!totalMemory) {
    return <span data-test-id={`node-memory-${row.name}`}>{t('N/A')}</span>;
  }

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

  const usedMemoryString = `${usedMemoryValue} ${usedMemoryUnits} / ${totalMemoryValue} ${totalMemoryUnits}`;
  return <span data-test-id={`node-memory-${row.name}`}>{usedMemoryString}</span>;
};

const renderSelectionCell = (row: NodeData, callbacks: NodesTableCallbacks): ReactNode => (
  <SelectionCell callbacks={callbacks} row={row} />
);

export const getNodesTableColumns = (
  t: TFunction,
): ColumnConfig<NodeData, NodesTableCallbacks>[] => [
  {
    key: 'selection',
    label: '',
    props: { className: 'node-row-selection-column' },
    renderCell: renderSelectionCell,
  },
  {
    getValue: (row) => row.name ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <span data-test-id={`node-name-${row.name}`}>{row.name}</span>,
    sortable: true,
  },
  {
    getValue: (row) => row.status ?? '',
    key: 'status',
    label: t('Status'),
    renderCell: (row) => (
      <span data-test-id={`node-status-${row.name}`}>
        <Status status={row.status} />
      </span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.cpuUtilization ?? '',
    key: 'cpu',
    label: t('CPU'),
    renderCell: (row) => <CPUCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row.memoryUtilization ?? '',
    key: 'memory',
    label: t('Memory'),
    renderCell: (row) => <MemoryCell row={row} />,
    sortable: true,
  },
];

export const getNodeRowId = (node: NodeData): string => node.name ?? 'unknown-node';
