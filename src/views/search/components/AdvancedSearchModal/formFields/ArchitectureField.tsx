import React, { FC, useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { getArchitectures } from '@virtualmachines/list/filters/utils';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

type ArchitectureFieldProps = {
  vms: V1VirtualMachine[];
};

const ArchitectureField: FC<ArchitectureFieldProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Architecture);

  const allArchitectures = useMemo(() => getArchitectures(vms), [vms]);

  if (allArchitectures.length <= 1) {
    return null;
  }

  return (
    <FormGroup label={t('Architecture type')}>
      <MultiSelectTypeahead
        allResourceNames={allArchitectures}
        selectedResourceNames={value}
        selectPlaceholder={t('Select architecture type')}
        setSelectedResourceNames={setValue}
      />
    </FormGroup>
  );
};

export default ArchitectureField;
