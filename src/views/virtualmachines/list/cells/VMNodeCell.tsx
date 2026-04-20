import React, { FCC } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getVMINodeName } from '@kubevirt-utils/resources/vmi';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';

import { VMCellWithCallbacksProps } from './types';

const VMNodeCell: FCC<VMCellWithCallbacksProps> = ({ callbacks, row }) => {
  if (!row) return null;

  const vmi = callbacks.getVmi(row);
  const nodeName = getVMINodeName(vmi);

  if (!nodeName) {
    return <>{NO_DATA_DASH}</>;
  }

  return (
    <MulticlusterResourceLink
      cluster={getCluster(row)}
      groupVersionKind={modelToGroupVersionKind(NodeModel)}
      name={nodeName}
      truncate
    />
  );
};

export default VMNodeCell;
