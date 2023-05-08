import { getGroupVersionKindForResource } from '@openshift-console/dynamic-plugin-sdk';
import { getK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';

import { K8sResourceKind } from '../../clusteroverview/utils/types';

export const nodeActions = (contextMenuResource: K8sResourceKind): KebabOption[] => {
  if (!contextMenuResource) {
    return null;
  }
  const resourceKind = getK8sModel(getGroupVersionKindForResource(contextMenuResource));
  const menuActions = [...Kebab.getExtensionsActionsForKind(resourceKind), ...Kebab.factory.common];

  return menuActions?.map((a) => a(resourceKind, contextMenuResource));
};
