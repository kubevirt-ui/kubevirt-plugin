import React, { FC } from 'react';

import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { useVirtualMachineInstanceMapper } from '@virtualmachines/list/hooks/useVirtualMachineInstanceMapper';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { getNodes } from '@virtualmachines/list/filters/utils';
import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const NodesField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Node);

  const { vmiMapper } = useVirtualMachineInstanceMapper();

  const allNodes = getNodes(vmiMapper);

  return (
    <FormGroup label={t('Nodes')}>
      <MultiSelectTypeahead
        allResourceNames={allNodes}
        data-test="adv-search-vm-nodes"
        selectedResourceNames={value}
        selectPlaceholder={t('Select node')}
        setSelectedResourceNames={setValue}
      />
    </FormGroup>
  );
};

export default NodesField;
