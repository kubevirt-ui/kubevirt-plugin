import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type useProjectsAndDataSourcesReturnType = {
  projectsNames: string[];
  dataSources: V1beta1DataSource[];
  projectsLoaded: boolean;
  dataSourcesLoaded: boolean;
  error: Error;
};

export const useProjectsAndDataSources = (
  projectSelected: string,
): useProjectsAndDataSourcesReturnType => {
  const [projects, projectsLoaded, projectsErrors] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    namespaced: false,
    isList: true,
  });

  const projectsNames = projects.map((project) => project.metadata.name);

  const [dataSources, dataSourcesLoaded, dataSourcesError] = useK8sWatchResource<
    V1beta1DataSource[]
  >({
    groupVersionKind: modelToGroupVersionKind(DataSourceModel),
    namespaced: true,
    isList: true,
    namespace: projectSelected,
  });

  return {
    projectsNames,
    dataSources,
    projectsLoaded,
    dataSourcesLoaded,
    error: projectsErrors || dataSourcesError,
  };
};
