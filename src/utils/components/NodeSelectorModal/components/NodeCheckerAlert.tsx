import * as React from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { GreenCheckCircleIcon, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  pluralize,
  Popover,
} from '@patternfly/react-core';

type NodeCheckerAlertProps = {
  nodesLoaded: boolean;
  preferredQualifiedNodes?: IoK8sApiCoreV1Node[];
  qualifiedNodes: IoK8sApiCoreV1Node[];
};

const NodeCheckerAlert: React.FC<NodeCheckerAlertProps> = ({
  nodesLoaded,
  preferredQualifiedNodes,
  qualifiedNodes,
}) => {
  const { t } = useKubevirtTranslation();
  if (!nodesLoaded) {
    return <Loading />;
  }

  const qualifiedNodesSize = qualifiedNodes?.length || 0;
  const preferredQualifiedNodesSize = preferredQualifiedNodes?.length ?? 0;

  const preferredQualifiedNodesNames = preferredQualifiedNodes?.map((node) => node?.metadata?.name);

  const matchingNodeText = pluralize(
    qualifiedNodesSize ? qualifiedNodesSize : preferredQualifiedNodesSize,
    'Node',
  );

  let nodes = [];
  if (qualifiedNodesSize) {
    nodes = qualifiedNodes;
  } else if (preferredQualifiedNodesSize) {
    nodes = preferredQualifiedNodes;
  }

  return (
    <Alert
      title={
        <>
          {!!qualifiedNodesSize || !!preferredQualifiedNodesSize ? (
            <>
              {t('{{matchingNodeText}} matching', {
                matchingNodeText,
              })}
              {!!qualifiedNodesSize &&
                !!preferredQualifiedNodesSize &&
                t(', {{preferredQualifiedNodesSize}} matching preferred Nodes found', {
                  preferredQualifiedNodesSize:
                    qualifiedNodesSize < preferredQualifiedNodesSize
                      ? qualifiedNodesSize
                      : preferredQualifiedNodesSize,
                })}
            </>
          ) : (
            t('No matching Nodes found for the labels')
          )}
        </>
      }
      variant={
        qualifiedNodesSize || preferredQualifiedNodesSize
          ? AlertVariant.success
          : AlertVariant.warning
      }
      isInline
    >
      {qualifiedNodesSize || preferredQualifiedNodesSize ? (
        <Popover
          bodyContent={
            <>
              {nodes?.map((node) => {
                const isPreferred = preferredQualifiedNodesNames?.includes(node.metadata.name);
                return (
                  <Flex key={node.metadata.uid}>
                    <FlexItem spacer={{ default: 'spacerXs' }}>
                      <ResourceLink
                        groupVersionKind={modelToGroupVersionKind(NodeModel)}
                        name={node.metadata.name}
                      />
                    </FlexItem>
                    {isPreferred && (
                      <FlexItem spacer={{ default: 'spacerXs' }}>
                        <GreenCheckCircleIcon /> {t('Preferred')}
                      </FlexItem>
                    )}
                  </Flex>
                );
              })}
            </>
          }
          headerContent={
            <>
              {t('{{qualifiedNodesCount}} matching Nodes found', {
                qualifiedNodesCount: qualifiedNodesSize || preferredQualifiedNodesSize,
              })}
            </>
          }
        >
          <Button isInline variant={ButtonVariant.link}>
            {t('View matching {{matchingNodeText}}', {
              matchingNodeText,
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
