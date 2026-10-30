import type { FC } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import type { Template, TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { isVirtualMachineTemplateRequest } from '@kubevirt-utils/resources/template';
import useTemplateCPUMemoryDisplayValue from '@kubevirt-utils/resources/template/hooks/useTemplateCPUMemoryDisplayValue';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';

type TemplateCPUMemoryCellContentProps = {
  namespace?: string;
  template: Template;
};

const TemplateCPUMemoryCellContent: FC<TemplateCPUMemoryCellContentProps> = ({
  namespace,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const { cpuMemoryText, isEmpty } = useTemplateCPUMemoryDisplayValue(template, { namespace });

  if (isEmpty) {
    return <MutedTextSpan text={t('None')} />;
  }

  return <>{cpuMemoryText}</>;
};

type TemplateCPUMemoryCellProps = {
  namespace?: string;
  row: TemplateOrRequest;
};

const TemplateCPUMemoryCell: FC<TemplateCPUMemoryCellProps> = ({ namespace, row }) => {
  if (isVirtualMachineTemplateRequest(row)) {
    return <>{NO_DATA_DASH}</>;
  }

  return <TemplateCPUMemoryCellContent namespace={namespace} template={row} />;
};

export default TemplateCPUMemoryCell;
