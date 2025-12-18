import React, { FC } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';

import InlineFilterSelect from '../FilterSelect/InlineFilterSelect';
import Loading from '../Loading/Loading';

type SelectProjectProps = {
  cluster?: string;
  selectedProject: string;
  setSelectedProject: (newProject: string) => void;
};

const SelectProject: FC<SelectProjectProps> = ({
  cluster,
  selectedProject,
  setSelectedProject,
}) => {
  const { t } = useKubevirtTranslation();

  const [projectNames, projectsLoaded] = useProjects(cluster);

  if (!projectsLoaded) return <Loading />;

  return (
    <InlineFilterSelect
      options={projectNames?.map((projectName) => ({
        children: projectName,
        groupVersionKind: modelToGroupVersionKind(ProjectModel),
        value: projectName,
      }))}
      selected={selectedProject}
      setSelected={setSelectedProject}
      toggleProps={{ isFullWidth: true, placeholder: t('Select project') }}
    />
  );
};

export default SelectProject;
