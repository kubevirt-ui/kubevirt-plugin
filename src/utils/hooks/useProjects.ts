import { useMemo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { getName } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type UseProjects = (cluster?: string, onlyUserProjects?: boolean) => [string[], boolean, any];

const useProjects: UseProjects = (cluster, onlyUserProjects = false) => {
  const [projectsData, loaded, error] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
  });

  const projectsNames = useMemo(() => projectsData?.map(getName), [projectsData]);

  const filteredProjectsData = useMemo(() => {
    return onlyUserProjects
      ? projectsNames?.filter((project) => !isSystemNamespace(project))
      : projectsNames;
  }, [projectsNames, onlyUserProjects]);

  const sortedProjectsNames = useMemo(() => {
    return filteredProjectsData?.sort((a, b) => a.localeCompare(b));
  }, [filteredProjectsData]);

  return [sortedProjectsNames, loaded, error];
};

export default useProjects;
