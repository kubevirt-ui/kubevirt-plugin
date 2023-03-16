import { useMemo } from 'react';

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

export const useDataSourcesTypeResources = (
  projectSelected: string,
): useProjectsAndDataSourcesReturnType => {
  const [projects, projectsLoaded, projectsErrors] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    namespaced: false,
    isList: true,
  });

  const projectsNames = useMemo(
    () => projects?.map((project) => project?.metadata?.name)?.sort((a, b) => a?.localeCompare(b)),
    [projects],
  );

  const dataSourceWathcResource = projectSelected
    ? {
        groupVersionKind: modelToGroupVersionKind(DataSourceModel),
        namespaced: true,
        isList: true,
        namespace: projectSelected,
      }
    : null;

  const [dataSourcesRaw, dataSourcesLoaded, dataSourcesError] =
    useK8sWatchResource<V1beta1DataSource[]>(dataSourceWathcResource);

  const dataSources = useMemo(
    () => dataSourcesRaw?.sort((a, b) => a?.metadata?.name?.localeCompare(b?.metadata?.name)) || [],
    [dataSourcesRaw],
  );

  return {
    projectsNames,
    dataSources,
    projectsLoaded,
    dataSourcesLoaded,
    error: projectsErrors || dataSourcesError,
  };
};
