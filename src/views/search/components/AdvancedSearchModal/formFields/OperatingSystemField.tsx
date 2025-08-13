import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import { FormGroup } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import MultiSelectTypeahead from '../../../../../utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const OperatingSystemField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.OS);

  return (
    <FormGroup label={t('Operating system')}>
      <MultiSelectTypeahead
        allResourceNames={Object.values(OS_NAME_LABELS)}
        data-test="adv-search-vm-os"
        selectedResourceNames={value}
        setSelectedResourceNames={setValue}
      />
    </FormGroup>
  );
};

export default OperatingSystemField;
