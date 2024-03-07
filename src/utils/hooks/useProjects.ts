import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseProjects = () => string[];

const useProjects: UseProjects = () => {
  const [projectsData] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
  });

  return projectsData?.map(({ metadata }) => metadata?.name);
};

export default useProjects;
