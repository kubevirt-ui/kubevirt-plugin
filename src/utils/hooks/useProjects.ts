import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseProjects = () => [string[], boolean, any];

const useProjects: UseProjects = () => {
  const [projectsData, loaded, error] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
  });

  return [projectsData?.map(getName)?.sort((a, b) => a?.localeCompare(b)), loaded, error];
};

export default useProjects;
