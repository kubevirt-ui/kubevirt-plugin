import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';

import { useVirtualMachineTemplatesCPUMemory } from '../hooks/useVirtualMachineTemplatesCPUMemory';

type TemplateCPUMemoryCellProps = {
  row: V1Template;
};

const TemplateCPUMemoryCell: FC<TemplateCPUMemoryCellProps> = ({ row }) => {
  const cpuMemory = useVirtualMachineTemplatesCPUMemory(row);

  return <>{cpuMemory}</>;
};

export default TemplateCPUMemoryCell;
