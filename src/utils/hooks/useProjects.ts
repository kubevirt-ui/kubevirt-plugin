import { useMemo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { getName } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type UseProjects = (cluster?: string) => [string[], boolean, any];

const useProjects: UseProjects = (cluster) => {
  const [projectsData, loaded, error] = useK8sWatchData<K8sResourceCommon[]>({
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
