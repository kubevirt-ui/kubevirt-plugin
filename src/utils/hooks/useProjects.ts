import { useMemo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

type UseProjects = (cluster?: string) => [string[], boolean, any];

const useProjects: UseProjects = (cluster) => {
  const [projectsData, loaded, error] = useFleetK8sWatchResource<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
  });

  const projectsNames = useMemo(
    () => projectsData?.map(getName).sort((a, b) => a.localeCompare(b)),
    [projectsData],
  );

  return [projectsNames, loaded, error];
};

export default useProjects;
