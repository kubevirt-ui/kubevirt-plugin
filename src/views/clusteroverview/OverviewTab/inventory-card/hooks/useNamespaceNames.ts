import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export const useNamespaceNames = (): string[] => {
  const [namespaces] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(NamespaceModel),
    isList: true,
    namespaced: false,
  });
  const namespaceNames = (namespaces || []).map((namespace) => namespace.metadata.name);

  if (isEmpty(namespaceNames) || !namespaceNames?.includes('openshift')) {
    namespaceNames.push('openshift');
  }

  return namespaceNames;
};
