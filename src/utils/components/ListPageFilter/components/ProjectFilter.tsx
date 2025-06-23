import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { SelectProps, ToolbarFilter } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import CheckboxSelect from '../../CheckboxSelect/CheckboxSelect';

type ProjectFilterProps = {
  applyTextFilters: (type: string, value?: string[]) => void;
};

const ProjectFilter: FC<ProjectFilterProps> = ({ applyTextFilters }) => {
  const { t } = useKubevirtTranslation();
  const queryParams = useQuery();

  const selectedProjects = useMemo(
    () => queryParams.get(VirtualMachineRowFilterType.Project)?.split(',') ?? [],
    [queryParams],
  );

  const [allProjects] = useProjects();

  const applyFilters = (projects?: string[]) =>
    applyTextFilters(VirtualMachineRowFilterType.Project, projects);

  const onSelect: SelectProps['onSelect'] = (_event, value: string) => {
    if (selectedProjects.includes(value)) {
      removeProject(value);
      return;
    }
    applyFilters([...selectedProjects, value]);
  };

  const removeProject = (projectToRemove: string) => {
    applyFilters(selectedProjects.filter((project) => project !== projectToRemove));
  };

  const projectsTitle = t('Projects');

  return (
    <ToolbarFilter
      categoryName={projectsTitle}
      deleteLabel={(_, label: string) => removeProject(label)}
      deleteLabelGroup={() => applyFilters(null)}
      labels={selectedProjects}
    >
      <CheckboxSelect
        options={allProjects?.map((project) => ({
          children: project,
          isSelected: selectedProjects.includes(project),
          value: project,
        }))}
        onSelect={onSelect}
        selectedValues={selectedProjects}
        toggleTitle={projectsTitle}
      />
    </ToolbarFilter>
  );
};

export default ProjectFilter;
