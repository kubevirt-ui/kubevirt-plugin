import * as React from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getUID } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { GreenCheckCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
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
                const isPreferred = preferredQualifiedNodesNames?.includes(getName(node));
                return (
                  <Flex key={getUID(node)}>
                    <FlexItem spacer={{ default: 'spacerXs' }}>
                      <MulticlusterResourceLink
                        cluster={getCluster(node)}
                        groupVersionKind={modelToGroupVersionKind(NodeModel)}
                        name={getName(node)}
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
