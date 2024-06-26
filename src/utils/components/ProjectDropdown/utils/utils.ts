import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const getProjectOptions = (includeAllProjects: boolean, projects: K8sResourceCommon[]) => {
  const projectOptions = projects
    .sort((a, b) => getName(a).localeCompare(getName(b)))
    .map((proj) => {
      const name = getName(proj);
      return {
        children: name,
        groupVersionKind: modelToGroupVersionKind(ProjectModel),
        value: name,
      };
    });

  const allProjects = includeAllProjects
    ? [
        {
          children: ALL_PROJECTS,
          groupVersionKind: modelToGroupVersionKind(ProjectModel),
          value: ALL_PROJECTS,
        },
      ].concat(projectOptions)
    : projectOptions;

  return allProjects;
};
