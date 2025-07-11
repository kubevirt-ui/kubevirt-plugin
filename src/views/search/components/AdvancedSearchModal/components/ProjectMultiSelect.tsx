import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';

import MultiSelect from './MultiSelect';

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
  const { t } = useKubevirtTranslation();
  const [projectNames] = useProjects();

  return (
    <MultiSelect
      allResourceNames={projectNames}
      data-test={dataTest}
      emptyValuePlaceholder={t('All projects')}
      selectedResourceNames={projects}
      selectPlaceholder={t('Select project')}
      setSelectedResourceNames={setProjects}
    />
  );
};

export default ProjectMultiSelect;
