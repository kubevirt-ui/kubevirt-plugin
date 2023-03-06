import React, { FC } from 'react';

import { Td } from '@patternfly/react-table';

type TableDataProps = {
  id: string;
  activeColumnIDs: string[];
};

const TableData: FC<TableDataProps> = ({ children, id, activeColumnIDs }) =>
  activeColumnIDs?.some((activeID) => activeID === id) ? <Td id={id}>{children}</Td> : null;

export default TableData;
