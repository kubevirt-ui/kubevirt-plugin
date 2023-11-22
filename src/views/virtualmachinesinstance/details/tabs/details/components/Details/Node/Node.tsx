import * as React from 'react';

import { NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type NodeProps = {
  nodeName: string;
};

const Node: React.FC<NodeProps> = ({ nodeName }) => {
  const { t } = useKubevirtTranslation();
  return nodeName ? (
    <ResourceLink kind={NodeModel.kind} name={nodeName} />
  ) : (
    <div className="text-muted">{t('Not available')} </div>
  );
};

export default Node;
