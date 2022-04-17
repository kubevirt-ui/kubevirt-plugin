import * as React from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { GreenCheckCircleIcon, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  Flex,
  FlexItem,
  pluralize,
  Popover,
} from '@patternfly/react-core';

type NodeCheckerAlertProps = {
  qualifiedNodes: IoK8sApiCoreV1Node[];
  prefferedQualifiedNodes?: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
};

const NodeCheckerAlert: React.FC<NodeCheckerAlertProps> = ({
  qualifiedNodes,
  prefferedQualifiedNodes,
  nodesLoaded,
}) => {
  const { t } = useKubevirtTranslation();
  if (!nodesLoaded) {
    return <Loading />;
  }

  const qualifiedNodesSize = qualifiedNodes?.length || 0;
  const prefferedQualifiedNodesSize = prefferedQualifiedNodes?.length ?? 0;

  const prefferedQualifiedNodesNames = prefferedQualifiedNodes?.map((node) => node?.metadata?.name);

  let nodes = [];
  if (qualifiedNodesSize) {
    nodes = qualifiedNodes;
  } else if (prefferedQualifiedNodesSize) {
    nodes = prefferedQualifiedNodes;
  }
  return (
    <Alert
      title={
        <>
          {!!qualifiedNodesSize || !!prefferedQualifiedNodesSize ? (
            <>
              {t(
                `${pluralize(
                  qualifiedNodesSize ? qualifiedNodesSize : prefferedQualifiedNodesSize,
                  'node',
                )} matching`,
              )}
              {!!qualifiedNodesSize &&
                !!prefferedQualifiedNodesSize &&
                t(
                  `, ${
                    qualifiedNodesSize < prefferedQualifiedNodesSize
                      ? qualifiedNodesSize
                      : prefferedQualifiedNodesSize
                  } matching preferred nodes found`,
                )}
            </>
          ) : (
            t('No matching nodes found for the labels')
          )}
        </>
      }
      variant={
        qualifiedNodesSize || prefferedQualifiedNodesSize
          ? AlertVariant.success
          : AlertVariant.warning
      }
      isInline
    >
      {qualifiedNodesSize || prefferedQualifiedNodesSize ? (
        <Popover
          headerContent={
            <>
              {t('{{qualifiedNodesCount}} mathcing nodes found', {
                qualifiedNodesCount: qualifiedNodesSize || prefferedQualifiedNodesSize,
              })}
            </>
          }
          bodyContent={
            <>
              {nodes?.map((node) => {
                const isPreffered = prefferedQualifiedNodesNames?.includes(node.metadata.name);
                return (
                  <Flex key={node.metadata.uid}>
                    <FlexItem spacer={{ default: 'spacerXs' }}>
                      <ResourceLink
                        groupVersionKind={modelToGroupVersionKind(NodeModel)}
                        name={node.metadata.name}
                      />
                    </FlexItem>
                    {isPreffered && (
                      <FlexItem spacer={{ default: 'spacerXs' }}>
                        <GreenCheckCircleIcon /> {t('Preffered')}
                      </FlexItem>
                    )}
                  </Flex>
                );
              })}
            </>
          }
        >
          <Button variant="link" isInline>
            {t(
              `view matching ${pluralize(
                qualifiedNodesSize || prefferedQualifiedNodesSize,
                'node',
              )}`,
            )}
          </Button>
        </Popover>
      ) : (
        t('Scheduling will not be possible at this state')
      )}
    </Alert>
  );
};

export default NodeCheckerAlert;
