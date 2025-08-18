import React, { FC } from 'react';

import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { FormGroup } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const ProjectField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Project);

  const [allProjectNames] = useProjects();

  return (
    <FormGroup label={t('Project')}>
      <MultiSelectTypeahead
        allResourceNames={allProjectNames}
        data-test="adv-search-vm-project"
        emptyValuePlaceholder={t('All projects')}
        selectedResourceNames={value}
        selectPlaceholder={t('Select project')}
        setSelectedResourceNames={setValue}
      />
    </FormGroup>
  );
};

export default ProjectField;
