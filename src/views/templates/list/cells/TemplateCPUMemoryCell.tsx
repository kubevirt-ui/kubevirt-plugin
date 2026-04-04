import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  isVirtualMachineTemplateRequest,
  TemplateOrRequest,
} from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';

import { getVirtualMachineTemplatesCPUMemoryText } from '../../utils/utils';

type TemplateCPUMemoryCellProps = {
  row: TemplateOrRequest;
};

const TemplateCPUMemoryCell: FC<TemplateCPUMemoryCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();

  if (isVirtualMachineTemplateRequest(row)) {
    return <>{NO_DATA_DASH}</>;
  }

  const cpuMemory = getVirtualMachineTemplatesCPUMemoryText(row, t);

  return <>{cpuMemory}</>;
};

export default TemplateCPUMemoryCell;
