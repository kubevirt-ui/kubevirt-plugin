import { useMemo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

type UseProjects = () => [string[], boolean, any];

const useProjects: UseProjects = () => {
  const [projectsData, loaded, error] = useFleetK8sWatchResource<K8sResourceCommon[]>({
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
