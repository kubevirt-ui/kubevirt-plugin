import React, { type ComponentType, type FC, type ReactElement } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useACMExtensionColumns from '@multicluster/hooks/useACMExtensionColumns/useACMExtensionColumns';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

type ACMExtentionsTableDataProps = {
  activeColumnIDs: Set<string>;
  vm: V1VirtualMachine;
};

const ACMExtentionsTableData: FC<ACMExtentionsTableDataProps> = ({
  activeColumnIDs,
  vm,
}): ReactElement => {
  const columnProperties = useACMExtensionColumns();

  return (
    <>
      {columnProperties.map((column) => {
        const CellColumn = column.cell as ComponentType<{ resource?: unknown }>;

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
      })}
    </>
  );
};

export default ACMExtentionsTableData;
