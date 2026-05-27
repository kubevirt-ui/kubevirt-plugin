import React, { FC } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { NamespaceWithVMCount } from '../../../types';

type NamespaceNameCellProps = {
  row: NamespaceWithVMCount;
};

const NamespaceNameCell: FC<NamespaceNameCellProps> = ({ row }) => {
  const { namespaceName } = row;

  if (!namespaceName) {
    return <span data-test="namespace-name">{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`namespace-name-${namespaceName}`}>
      <ResourceLink groupVersionKind={modelToGroupVersionKind(NamespaceModel)} name={namespaceName} />
    </span>
  );
};

export default NamespaceNameCell;
