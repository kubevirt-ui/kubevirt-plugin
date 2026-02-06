import { useMemo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { getName } from '@kubevirt-utils/resources/shared';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type UseProjectResources = (
  cluster?: string,
  onlyUserProjects?: boolean,
) => [K8sResourceCommon[], boolean, Error];

const useProjectResources: UseProjectResources = (cluster, onlyUserProjects = false) => {
  const [projects, loaded, error] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
  });

  const filteredProjects = useMemo(() => {
    return onlyUserProjects
      ? projects?.filter((project) => !isSystemNamespace(getName(project)))
      : projects;
  }, [projects, onlyUserProjects]);

  const sortedProjects = useMemo(() => {
    return filteredProjects?.sort((a, b) => universalComparator(getName(a), getName(b)));
  }, [filteredProjects]);

  return [sortedProjects, loaded, error];
};

export default useProjectResources;
