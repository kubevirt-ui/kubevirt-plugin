import React from 'react';
import { Link } from 'react-router-dom';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye } from '@patternfly/react-core';

type ComponentReadyProps = React.PropsWithChildren<{
  isReady: boolean;
  linkToMetrics?: string;
  spinner?: boolean;
  text?: string;
}>;

const ComponentReady: React.FC<ComponentReadyProps> = ({
  children,
  isReady,
  linkToMetrics,
  spinner,
  text,
}) => {
  const { t } = useKubevirtTranslation();
  const renderText = text || t('No data available');
  return isReady ? (
    <>{children}</>
  ) : (
    <Bullseye className="ComponentReady">
      {!spinner && !linkToMetrics && <MutedTextSpan text={renderText} />}
      {spinner && <Loading />}
      {linkToMetrics && !spinner && <Link to={linkToMetrics}>{renderText}</Link>}
    </Bullseye>
  );
};

export default ComponentReady;
