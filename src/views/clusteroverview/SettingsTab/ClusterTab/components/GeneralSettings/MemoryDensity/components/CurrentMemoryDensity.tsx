import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection } from '@patternfly/react-core';

type CurrentMemoryDensityProps = {
  children: React.ReactNode;
  currentOvercommit: number;
  isLoading: boolean;
};

const CurrentMemoryDensity: FC<CurrentMemoryDensityProps> = ({
  children,
  currentOvercommit,
  isLoading,
}) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandableSection
      data-test-id="memory-density-modify-button"
      isExpanded={isExpanded}
      isIndented={false}
      onToggle={(_event, expanded) => !isLoading && setIsExpanded(expanded)}
      toggleText={t('Current memory density: {{percentage}}%', { percentage: currentOvercommit })}
    >
      {children}
    </ExpandableSection>
  );
};

export default CurrentMemoryDensity;
