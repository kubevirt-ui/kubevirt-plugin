import React from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye } from '@patternfly/react-core';

type ComponentReadyProps = React.PropsWithChildren<{ isReady: boolean; text?: string }>;

const ComponentReady: React.FC<ComponentReadyProps> = ({ isReady, children, text }) => {
  const { t } = useKubevirtTranslation();
  return isReady ? (
    <>{children}</>
  ) : (
    <Bullseye className="ComponentReady">
      <MutedTextSpan text={text || t('No data available')} />
    </Bullseye>
  );
};

export default ComponentReady;
