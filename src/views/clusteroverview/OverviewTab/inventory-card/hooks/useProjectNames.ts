import { modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useProjectOrNamespaceModel } from '@kubevirt-utils/hooks/useProjectOrNamespaceModel';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export const useProjectNames = (): string[] => {
  const model = useProjectOrNamespaceModel();
  const [projects] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(model),
    isList: true,
    namespaced: false,
  });
  const projectNames = (projects || []).map((project) => project.metadata.name);

  if (isEmpty(projectNames) || !projectNames?.includes('openshift')) {
    projectNames.push('openshift');
  }

  return projectNames;
};
