import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export const useProjectNames = (): string[] => {
  const [projects] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    namespaced: false,
    isList: true,
  });
  const projectNames = (projects || []).map((project) => project.metadata.name);

  if (isEmpty(projectNames) || !projectNames?.includes('openshift')) {
    projectNames.push('openshift');
  }

  return projectNames;
};
