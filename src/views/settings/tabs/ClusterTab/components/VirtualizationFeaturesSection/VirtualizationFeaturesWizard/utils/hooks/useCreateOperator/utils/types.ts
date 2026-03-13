import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';

export type CreateOperatorResources = {
  consoleOperatorConfig: K8sResourceKind;
  namespaces: K8sResourceKind[];
};
