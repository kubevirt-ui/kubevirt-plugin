import React, { FC } from 'react';

import { BaseCellProps, Td } from '@patternfly/react-table';
import { TdFavoritesType } from '@patternfly/react-table/dist/esm/components/Table/base';

type TableDataProps = {
  activeColumnIDs: string[];
  favorites?: TdFavoritesType;
  id: string;
  width?: BaseCellProps['width'];
};

const TableData: FC<TableDataProps> = ({ activeColumnIDs, children, favorites, id, width = 10 }) =>
  activeColumnIDs?.some((activeID) => activeID === id) ? (
    <Td favorites={favorites} id={id} width={width}>
      {children}
    </Td>
  ) : null;

export default TableData;
