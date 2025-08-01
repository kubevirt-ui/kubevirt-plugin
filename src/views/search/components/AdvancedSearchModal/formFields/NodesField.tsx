import React, { FC } from 'react';

import MultiSelectTypeahead from '@kubevirt-utils/components/MultiSelectTypeahead/MultiSelectTypeahead';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { useVirtualMachineInstanceMapper } from '@virtualmachines/list/hooks/useVirtualMachineInstanceMapper';
import { useNodesFilter } from '@virtualmachines/list/hooks/useVMListFilters/useNodesFilter';

type NodesFieldProps = {
  nodes: string[];
  setNodes: (nodes: string[]) => void;
};

const NodesField: FC<NodesFieldProps> = ({ nodes, setNodes }) => {
  const { t } = useKubevirtTranslation();

  const vmiMapper = useVirtualMachineInstanceMapper();
  const nodesFilter = useNodesFilter(vmiMapper);

  const allNodes = nodesFilter.items.map((node) => node.id);

  return (
    <FormGroup label={t('Nodes')}>
      <MultiSelectTypeahead
        allResourceNames={allNodes}
        data-test="adv-search-vm-nodes"
        selectedResourceNames={nodes}
        selectPlaceholder={t('Select node')}
        setSelectedResourceNames={setNodes}
      />
    </FormGroup>
  );
};

export default NodesField;
