import React, { FC } from 'react';

import { BaseCellProps, Td } from '@patternfly/react-table';

type TableDataProps = {
  id: string;
  activeColumnIDs: string[];
  width?: BaseCellProps['width'];
};

const TableData: FC<TableDataProps> = ({ children, id, activeColumnIDs, width = 10 }) =>
  activeColumnIDs?.some((activeID) => activeID === id) ? (
    <Td id={id} width={width}>
      {children}
    </Td>
  ) : null;

export default TableData;
