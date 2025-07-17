import React, { FC } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { getProjectOptions } from '@kubevirt-utils/components/ProjectDropdown/utils/utils';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type ProjectDropdownProps = {
  cluster?: string;
  includeAllProjects?: boolean;
  onChange: (project: string) => void;
  selectedProject: string;
};

const ProjectDropdown: FC<ProjectDropdownProps> = ({
  cluster,
  includeAllProjects = true,
  onChange,
  selectedProject,
}) => {
  const [projects] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  return (
    <div className="project-dropdown">
      <InlineFilterSelect
        options={getProjectOptions(includeAllProjects, projects)}
        selected={selectedProject || ALL_PROJECTS}
        setSelected={onChange}
        toggleProps={{ isFullWidth: true }}
      />
    </div>
  );
};

export default ProjectDropdown;
