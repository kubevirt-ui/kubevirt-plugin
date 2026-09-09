import React, { type FC } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type NodeProps = {
  nodeName: string;
};

const Node: FC<NodeProps> = ({ nodeName }) => {
  const { t } = useKubevirtTranslation();
  return nodeName ? (
    <ResourceLink groupVersionKind={modelToGroupVersionKind(NodeModel)} name={nodeName} />
  ) : (
    <div className="pf-v6-u-text-color-subtle">{t('Not available')} </div>
  );
};

export default Node;
