import React, { FC, useMemo } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { getSelectDataTestProps } from '@kubevirt-utils/utils/selectDataTest';
import { MultiTypeaheadSelect, MultiTypeaheadSelectOption } from '@patternfly/react-templates';

type ProjectMultiSelectProps = {
  'data-test'?: string;
  projects: string[];
  setProjects: React.Dispatch<React.SetStateAction<string[]>>;
};

const ProjectMultiSelect: FC<ProjectMultiSelectProps> = ({
  'data-test': dataTest,
  projects,
  setProjects,
}) => {
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
      {...getSelectDataTestProps(dataTest)}
    />
  );
};

export default ProjectMultiSelect;
