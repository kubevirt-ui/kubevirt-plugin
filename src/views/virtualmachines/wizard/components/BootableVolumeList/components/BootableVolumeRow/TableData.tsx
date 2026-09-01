import React, { type FC } from 'react';

import { Td, type TdProps } from '@patternfly/react-table';

type TableDataProps = Omit<TdProps, 'ref'> & {
  activeColumnIDs: string[];
};

const TableData: FC<TableDataProps> = ({ activeColumnIDs, children, id, ...otherProps }) =>
  activeColumnIDs?.includes(id) ? (
    <Td id={id} {...otherProps}>
      {children}
    </Td>
  ) : null;

export default TableData;
