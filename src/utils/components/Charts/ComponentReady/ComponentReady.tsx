import React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye } from '@patternfly/react-core';

type ComponentReadyProps = React.PropsWithChildren<{
  isReady: boolean;
  spinner?: boolean;
  text?: string;
}>;

const ComponentReady: React.FC<ComponentReadyProps> = ({ children, isReady, spinner, text }) => {
  const { t } = useKubevirtTranslation();
  return isReady ? (
    <>{children}</>
  ) : (
    <Bullseye className="ComponentReady">
      {(!spinner || text) && <MutedTextSpan text={text || t('No data available')} />}
      {spinner && <Loading />}
    </Bullseye>
  );
};

export default ComponentReady;
