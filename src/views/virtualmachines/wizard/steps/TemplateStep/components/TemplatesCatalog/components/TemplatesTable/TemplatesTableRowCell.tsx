import React, { type FC } from 'react';

import { Td, type TdProps } from '@patternfly/react-table';

type TemplatesTableRowCellProps = Omit<TdProps, 'ref'> & {
  activeColumnIDs: string[];
};

const TemplatesTableRowCell: FC<TemplatesTableRowCellProps> = ({
  activeColumnIDs,
  children,
  id,
  ...otherProps
}) =>
  activeColumnIDs?.includes(id) ? (
    <Td id={id} {...otherProps}>
      {children}
    </Td>
  ) : null;

export default TemplatesTableRowCell;
