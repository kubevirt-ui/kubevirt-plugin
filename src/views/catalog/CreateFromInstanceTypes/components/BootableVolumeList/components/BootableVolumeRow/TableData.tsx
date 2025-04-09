import React, { FC } from 'react';

import { Td, TdProps } from '@patternfly/react-table';

type TableDataProps = Omit<TdProps, 'ref'> & {
  activeColumnIDs: string[];
};

const TableData: FC<TableDataProps> = ({ activeColumnIDs, children, id, ...otherProps }) =>
  activeColumnIDs?.some((activeID) => activeID === id) ? (
    <Td id={id} {...otherProps}>
      {children}
    </Td>
  ) : null;

export default TableData;
