import { ComponentType } from 'react';
import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt/models';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';
import useACMExtensionColumns from '@virtualmachines/list/hooks/useACMExtensionColumns/useACMExtensionColumns';

const useACMTableData = (vm: V1VirtualMachine, activeColumnIDs: Set<string>) => {
  const columnProperties = useACMExtensionColumns();

  return columnProperties.map((column) => {
    const CellColumn = column.cell as ComponentType<{
      resource?: any;
    }>;

    return (
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="vm-column"
        id={column.header}
        key={column.header}
      >
        <CellColumn resource={vm} />
      </TableData>
    );
  });
};

export default useACMTableData;
