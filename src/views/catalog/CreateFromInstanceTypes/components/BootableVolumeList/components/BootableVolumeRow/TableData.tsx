import React, { FC } from 'react';

import { BaseCellProps, Td } from '@patternfly/react-table';

type TableDataProps = {
  activeColumnIDs: string[];
  id: string;
  width?: BaseCellProps['width'];
};

const TableData: FC<TableDataProps> = ({ activeColumnIDs, children, id, width = 10 }) =>
  activeColumnIDs?.some((activeID) => activeID === id) ? (
    <Td id={id} width={width}>
      {children}
    </Td>
  ) : null;

export default TableData;
