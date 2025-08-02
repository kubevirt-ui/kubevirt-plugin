import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
import { OperatorGroupKind, SubscriptionKind } from '@overview/utils/types';

export type CreateOperatorResources = {
  consoleOperatorConfig: K8sResourceKind;
  namespaces: K8sResourceKind[];
  operatorGroups: OperatorGroupKind[];
  subscriptions: SubscriptionKind[];
};
