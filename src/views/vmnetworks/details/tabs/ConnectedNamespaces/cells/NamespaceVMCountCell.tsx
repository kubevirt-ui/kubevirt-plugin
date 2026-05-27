import React, { FC } from 'react';

import { NamespaceWithVMCount } from '../../../types';

type NamespaceVMCountCellProps = {
  row: NamespaceWithVMCount;
};

const NamespaceVMCountCell: FC<NamespaceVMCountCellProps> = ({ row }) => {
  const { namespaceName, vmCount } = row;

  return <span data-test={`namespace-vmcount-${namespaceName ?? 'unknown'}`}>{vmCount}</span>;
};

export default NamespaceVMCountCell;
