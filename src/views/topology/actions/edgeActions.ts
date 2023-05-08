import i18next from 'i18next';

import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { Action, K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { getK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';
import { Edge, isNode, Node } from '@patternfly/react-topology';

import { moveConnectionModal } from '../components/modals/MoveConnectionModal';
import { TYPE_CONNECTS_TO, TYPE_SERVICE_BINDING, TYPE_TRAFFIC_CONNECTOR } from '../const';
import { removeConnection } from '../utils';
import {
  TYPE_EVENT_PUB_SUB,
  TYPE_EVENT_SOURCE,
  TYPE_EVENT_SOURCE_LINK,
  TYPE_KAFKA_CONNECTION_LINK,
  TYPE_KNATIVE_REVISION,
  TYPE_KNATIVE_SERVICE,
  TYPE_MANAGED_KAFKA_CONNECTION,
  TYPE_REVISION_TRAFFIC,
} from '../utils/knative/knative-const';
import { getResource } from '../utils/topology-utils';

/**
 * @deprecated migrated to use new Action extension, use MoveConnectorAction
 */
const moveConnection = (edge: Edge, availableTargets: Node[]) => {
  const resourceObj = getResource(edge.getSource());
  const resourceModel = getK8sModel(resourceObj);

  return {
    // t('kubevirt-plugin~Move connector')
    labelKey: 'kubevirt-plugin~Move connector',
    callback: () => {
      moveConnectionModal({ edge, availableTargets });
    },
    isDisabled: availableTargets.length <= 1,
    accessReview: asAccessReview(resourceModel, resourceObj, 'delete'),
  };
};

const getAvailableTargetForEdge = (edge: Edge, nodes: Node[]) => {
  const currentTargets = edge
    .getSource()
    .getSourceEdges()
    .map((e) => e.getTarget().getId());

  return nodes
    .filter((n) => {
      if (n.getId() === edge.getSource().getId()) {
        return false;
      }
      if (n.getId() !== edge.getTarget().getId() && currentTargets.includes(n.getId())) {
        return false;
      }
      if (n.getType() === TYPE_EVENT_SOURCE) {
        return false;
      }
      switch (edge.getType()) {
        case TYPE_CONNECTS_TO:
          return n.getType() !== TYPE_KNATIVE_REVISION && n.getType() !== TYPE_KNATIVE_SERVICE;
        case TYPE_SERVICE_BINDING:
          return false;
        case TYPE_EVENT_SOURCE_LINK:
          return n.getType() === TYPE_KNATIVE_SERVICE || n.getType() === TYPE_EVENT_PUB_SUB;
        case TYPE_REVISION_TRAFFIC:
          return false;
        case TYPE_TRAFFIC_CONNECTOR:
          return false;
        case TYPE_KAFKA_CONNECTION_LINK:
          return n.getType() === TYPE_MANAGED_KAFKA_CONNECTION;
        default:
          return true;
      }
    })
    .sort((n1, n2) => n1.getLabel().localeCompare(n2.getLabel()));
};

export const MoveConnectorAction = (kindObj: K8sModel, element: Edge): Action => {
  const resourceObj = getResource(element.getSource());

  const nodes = element
    .getController()
    .getElements()
    .filter((e) => isNode(e) && !e.isGroup()) as Node[];
  const availableTargets = getAvailableTargetForEdge(element, nodes);

  return {
    id: 'move-visual-connector',
    label: i18next.t('kubevirt-plugin~Move connector'),
    cta: () => {
      moveConnectionModal({ edge: element, availableTargets });
    },
    disabled: availableTargets.length <= 1,
    accessReview: asAccessReview(kindObj, resourceObj, 'delete'),
  };
};

export const DeleteConnectorAction = (kindObj: K8sModel, element: Edge): Action => {
  const resourceObj = getResource(element.getSource());
  return {
    id: 'delete-connector',
    label: i18next.t('kubevirt-plugin~Delete connector'),
    cta: () => {
      removeConnection(element);
    },
    accessReview: asAccessReview(kindObj, resourceObj, 'delete'),
  };
};

/**
 * @deprecated remove this after migrating the Traffic connector side-panel to dynamic extensions
 */
export const edgeActions = (edge: Edge, nodes: Node[]): KebabOption[] => {
  const actions: KebabOption[] = [];
  const availableTargets = getAvailableTargetForEdge(edge, nodes);
  actions.push(moveConnection(edge, availableTargets));
  return actions;
};
