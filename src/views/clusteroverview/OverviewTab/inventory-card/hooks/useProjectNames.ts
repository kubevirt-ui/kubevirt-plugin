import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export const useProjectNames = (): string[] => {
  const [projects] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });
  const projectNames = (projects || []).map((project) => project.metadata.name);

  if (isEmpty(projectNames) || !projectNames?.includes('openshift')) {
    projectNames.push('openshift');
  }

  return projectNames;
};
