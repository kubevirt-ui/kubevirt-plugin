import type { FC } from 'react';

import TemplateCPUMemoryDisplay from '@kubevirt-utils/components/TemplateCPUMemoryDisplay/TemplateCPUMemoryDisplay';
import type { TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { isVirtualMachineTemplateRequest } from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';

type TemplateCPUMemoryCellProps = {
  row: TemplateOrRequest;
};

const TemplateCPUMemoryCell: FC<TemplateCPUMemoryCellProps> = ({ row }) => {
  if (isVirtualMachineTemplateRequest(row)) {
    return <>{NO_DATA_DASH}</>;
  }

  return <TemplateCPUMemoryDisplay template={row} />;
};

export default TemplateCPUMemoryCell;
