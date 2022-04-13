import * as React from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Button, pluralize, Popover } from '@patternfly/react-core';

type NodeCheckerAlertProps = {
  qualifiedNodes: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
};

const NodeCheckerAlert: React.FC<NodeCheckerAlertProps> = ({ qualifiedNodes, nodesLoaded }) => {
  const { t } = useKubevirtTranslation();
  if (!nodesLoaded) {
    return <Loading />;
  }

  const qualifiedNodesSize = qualifiedNodes.length;

  return (
    <Alert
      title={
        qualifiedNodesSize
          ? t(`${pluralize(qualifiedNodesSize, 'node')} matching`)
          : t('No matching nodes found for the labels')
      }
      variant={qualifiedNodesSize ? AlertVariant.success : AlertVariant.warning}
      isInline
    >
      {qualifiedNodesSize ? (
        <Popover
          headerContent={t('{{qualifiedNodesCount}} nodes found', {
            qualifiedNodesCount: qualifiedNodes?.length,
          })}
          bodyContent={
            <>
              {qualifiedNodes?.map((node) => (
                <ResourceLink
                  key={node.metadata.uid}
                  groupVersionKind={modelToGroupVersionKind(NodeModel)}
                  name={node.metadata.name}
                />
              ))}
            </>
          }
        >
          <Button variant="link" isInline>
            {t('view {{qualifiedNodesCount}} matching nodes', {
              qualifiedNodesCount: qualifiedNodes?.length,
            })}
          </Button>
        </Popover>
      ) : (
        t('Scheduling will not be possible at this state')
      )}
    </Alert>
  );
};

export default NodeCheckerAlert;
