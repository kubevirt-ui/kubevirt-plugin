import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { labelParser } from '@kubevirt-utils/components/ListPageFilter/utils';
import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

type LabelsFieldProps = {
  vms: V1VirtualMachine[];
};

const LabelsField: FC<LabelsFieldProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Labels);
  const { value: labelInputValue } = useAdvancedSearchField('labelInputText');

  const allLabels = useMemo(() => Array.from(labelParser(vms)), [vms]);

  return (
    <FormGroup label={t('Labels')}>
      <MultiSelectTypeahead
        allResourceNames={allLabels}
        data-test="adv-search-vm-labels"
        initialInputValue={labelInputValue}
        selectedResourceNames={value}
        selectPlaceholder={t('Add label')}
        setSelectedResourceNames={setValue}
      />
    </FormGroup>
  );
};

export default LabelsField;
