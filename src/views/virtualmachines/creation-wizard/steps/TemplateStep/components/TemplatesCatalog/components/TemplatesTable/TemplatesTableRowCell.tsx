import React, { FCC } from 'react';

import { Td, TdProps } from '@patternfly/react-table';

type TemplatesTableRowCellProps = Omit<TdProps, 'ref'> & {
  activeColumnIDs: string[];
};

const TemplatesTableRowCell: FCC<TemplatesTableRowCellProps> = ({
  activeColumnIDs,
  children,
  id,
  ...otherProps
}) =>
  activeColumnIDs?.some((activeID) => activeID === id) ? (
    <Td id={id} {...otherProps}>
      {children}
    </Td>
  ) : null;

export default TemplatesTableRowCell;
