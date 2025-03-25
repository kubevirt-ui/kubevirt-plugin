import React, { FC, useMemo } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { MultiTypeaheadSelect, MultiTypeaheadSelectOption } from '@patternfly/react-templates';

type ProjectMultiSelectProps = {
  projects: string[];
  setProjects: React.Dispatch<React.SetStateAction<string[]>>;
};

const ProjectMultiSelect: FC<ProjectMultiSelectProps> = ({ projects, setProjects }) => {
  const [projectNames] = useProjects();
  const projectOptions = useMemo<MultiTypeaheadSelectOption[]>(
    () =>
      projectNames.map((projectName) => ({
        content: projectName,
        selected: projects.includes(projectName),
        value: projectName,
      })),
    [projects, projectNames],
  );

  return (
    <MultiTypeaheadSelect
      onSelectionChange={(_e, selectedProjects: string[]) => {
        setProjects(selectedProjects);
      }}
      initialOptions={projectOptions}
      isScrollable
      placeholder={projects.length > 0 ? t('Select project') : t('All projects')}
    />
  );
};

export default ProjectMultiSelect;
