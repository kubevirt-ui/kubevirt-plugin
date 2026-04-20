import React, { FCC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type VMNamespaceCellProps = {
  row: V1VirtualMachine;
};

const VMNamespaceCell: FCC<VMNamespaceCellProps> = ({ row }) => {
  const namespace = getNamespace(row);

  if (!namespace) {
    return <span data-test="vm-namespace">{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`vm-namespace-${namespace}`}>
      <ResourceLink groupVersionKind={modelToGroupVersionKind(NamespaceModel)} name={namespace} />
    </span>
  );
};

export default VMNamespaceCell;
