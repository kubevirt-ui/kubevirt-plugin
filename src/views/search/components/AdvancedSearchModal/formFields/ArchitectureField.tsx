import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { getArchitectureFilter } from '@virtualmachines/list/utils/filters/getArchitectureFilter';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

type ArchitectureFieldProps = {
  vms: V1VirtualMachine[];
};

const ArchitectureField: FC<ArchitectureFieldProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Architecture);

  const allArchitectures = useMemo(
    () => getArchitectureFilter(t, vms).items.map((item) => item.id),
    [t, vms],
  );

  if (allArchitectures.length <= 1) {
    return null;
  }

  return (
    <FormGroup label={t('Architecture type')}>
      <MultiSelectTypeahead
        allResourceNames={allArchitectures}
        data-test="adv-search-vm-architecture-type"
        selectedResourceNames={value}
        selectPlaceholder={t('Select architecture type')}
        setSelectedResourceNames={setValue}
      />
    </FormGroup>
  );
};

export default ArchitectureField;
