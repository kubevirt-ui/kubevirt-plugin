import React, { FC } from 'react';

import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { FormGroup } from '@patternfly/react-core';

type ProjectFieldProps = {
  projects: string[];
  setProjects: (projects: string[]) => void;
};

const ProjectField: FC<ProjectFieldProps> = ({ projects, setProjects }) => {
  const { t } = useKubevirtTranslation();

  const [allProjectNames] = useProjects();

  return (
    <FormGroup label={t('Project')}>
      <MultiSelectTypeahead
        allResourceNames={allProjectNames}
        data-test="adv-search-vm-project"
        emptyValuePlaceholder={t('All projects')}
        selectedResourceNames={projects}
        selectPlaceholder={t('Select project')}
        setSelectedResourceNames={setProjects}
      />
    </FormGroup>
  );
};

export default ProjectField;
