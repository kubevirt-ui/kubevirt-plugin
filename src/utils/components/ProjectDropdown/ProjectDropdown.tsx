import React, { FC } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { getProjectOptions } from '@kubevirt-utils/components/ProjectDropdown/utils/utils';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type ProjectDropdownProps = {
  includeAllProjects?: boolean;
  onChange: (project: string) => void;
  selectedProject: string;
};

const ProjectDropdown: FC<ProjectDropdownProps> = ({
  includeAllProjects = true,
  onChange,
  selectedProject,
}) => {
  const [projects] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const onSelect = (value: string) => {
    onChange(value === ALL_PROJECTS ? '' : value);
  };

  return (
    <div className="project-dropdown">
      <InlineFilterSelect
        options={getProjectOptions(includeAllProjects, projects)}
        selected={selectedProject || ALL_PROJECTS}
        setSelected={onSelect}
        toggleProps={{ isFullWidth: true }}
      />
    </div>
  );
};

export default ProjectDropdown;
