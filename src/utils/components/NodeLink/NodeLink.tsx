import React, { FCC } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';

type NodeLinkProps = {
  cluster?: string;
  nodeName: string;
};

const NodeLink: FCC<NodeLinkProps> = ({ cluster, nodeName }) => {
  if (!nodeName) return <>{NO_DATA_DASH}</>;

  return (
    <MulticlusterResourceLink
      cluster={cluster}
      groupVersionKind={modelToGroupVersionKind(NodeModel)}
      name={nodeName}
    />
  );
};

export default NodeLink;
