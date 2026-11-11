import { type FC } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Skeleton } from '@patternfly/react-core';

type TemplateInstanceTypeCPUMemoryDescriptionProps = {
  cpuMemoryText: string | undefined;
  instanceTypesLoaded: boolean;
};

const TemplateInstanceTypeCPUMemoryDescription: FC<
  TemplateInstanceTypeCPUMemoryDescriptionProps
> = ({ cpuMemoryText, instanceTypesLoaded }) => {
  const { t } = useKubevirtTranslation();

  if (!instanceTypesLoaded) {
    return <Skeleton className="pf-m-width-sm" />;
  }

  if (cpuMemoryText) {
    return <span data-test="cpu-memory-value">{cpuMemoryText}</span>;
  }

  return <MutedTextSpan text={t('Unknown')} />;
};

export default TemplateInstanceTypeCPUMemoryDescription;
