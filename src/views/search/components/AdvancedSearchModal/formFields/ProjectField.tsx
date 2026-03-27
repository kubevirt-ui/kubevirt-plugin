import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import useProjectsWithVMs from '../hooks/useProjectsWithVMs';
import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

type ProjectFieldProps = {
  vms: V1VirtualMachine[];
};

const ProjectField: FC<ProjectFieldProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Project);

  const allProjectNames = useProjectsWithVMs(vms);

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
