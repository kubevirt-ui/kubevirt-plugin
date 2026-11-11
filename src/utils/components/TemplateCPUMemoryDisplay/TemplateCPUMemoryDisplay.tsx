import { type FC } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type Template } from '@kubevirt-utils/resources/template';
import useTemplateCPUMemoryDisplayValue, {
  type UseTemplateCPUMemoryDisplayOptions,
} from '@kubevirt-utils/resources/template/hooks/useTemplateCPUMemoryDisplayValue';
import { Skeleton } from '@patternfly/react-core';

type TemplateCPUMemoryDisplayProps = {
  options?: UseTemplateCPUMemoryDisplayOptions;
  template: Template;
};

/** Resolves and renders template CPU/memory (watches instance types per template). */
const TemplateCPUMemoryDisplay: FC<TemplateCPUMemoryDisplayProps> = ({ options, template }) => {
  const { t } = useKubevirtTranslation();
  const { cpuMemoryText, instanceTypesLoaded, isEmpty } = useTemplateCPUMemoryDisplayValue(
    template,
    options,
  );

  if (!instanceTypesLoaded) {
    return <Skeleton className="pf-m-width-sm" />;
  }

  if (isEmpty) {
    return <MutedTextSpan text={t('None')} />;
  }

  return cpuMemoryText;
};

export default TemplateCPUMemoryDisplay;
