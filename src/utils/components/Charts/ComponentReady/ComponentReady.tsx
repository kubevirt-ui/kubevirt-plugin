import React from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye } from '@patternfly/react-core';
import Loading from '@kubevirt-utils/components/Loading/Loading';

type ComponentReadyProps = React.PropsWithChildren<{
  isReady: boolean;
  text?: string;
  spinner?: boolean;
}>;

const ComponentReady: React.FC<ComponentReadyProps> = ({ isReady, children, text, spinner }) => {
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
