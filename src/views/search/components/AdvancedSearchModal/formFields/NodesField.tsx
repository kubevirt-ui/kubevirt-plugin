import React, { FC } from 'react';

import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { useVirtualMachineInstanceMapper } from '@virtualmachines/list/hooks/useVirtualMachineInstanceMapper';
import { useNodesFilter } from '@virtualmachines/list/hooks/useVMListFilters/useNodesFilter';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const NodesField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue, value } = useAdvancedSearchField(VirtualMachineRowFilterType.Node);

  const vmiMapper = useVirtualMachineInstanceMapper();
  const nodesFilter = useNodesFilter(vmiMapper);

  const allNodes = nodesFilter.items.map((node) => node.id);

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
