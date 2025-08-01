import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { useArchitectureFilter } from '@virtualmachines/list/hooks/useVMListFilters/useArchitectureFilter';

type ArchitectureFieldProps = {
  architectures: string[];
  setArchitectures: (architectures: string[]) => void;
  vms: V1VirtualMachine[];
};

const ArchitectureField: FC<ArchitectureFieldProps> = ({
  architectures,
  setArchitectures,
  vms,
}) => {
  const { t } = useKubevirtTranslation();

  const allArchitectures = useArchitectureFilter(vms).items.map((item) => item.id);

  if (allArchitectures.length <= 1) {
    return null;
  }

  return (
    <FormGroup label={t('Architecture type')}>
      <MultiSelectTypeahead
        allResourceNames={allArchitectures}
        data-test="adv-search-vm-architecture-type"
        selectedResourceNames={architectures}
        selectPlaceholder={t('Select architecture type')}
        setSelectedResourceNames={setArchitectures}
      />
    </FormGroup>
  );
};

export default ArchitectureField;
