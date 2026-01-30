import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye } from '@patternfly/react-core';

type ComponentReadyProps = React.PropsWithChildren<{
  error?: Error | unknown;
  isLoading?: boolean;
  isReady: boolean;
  linkToMetrics?: string;
  text?: string;
}>;

const ComponentReady: React.FC<ComponentReadyProps> = ({
  children,
  error,
  isLoading,
  isReady,
  linkToMetrics,
  text,
}) => {
  const { t } = useKubevirtTranslation();

  const renderText = text || t('No data available');

  return (
    <StateHandler error={error} hasData={isReady} loaded={!isLoading} withBullseye>
      {isReady ? (
        <>{children}</>
      ) : (
        <Bullseye className="ComponentReady">
          {!linkToMetrics && <MutedTextSpan text={renderText} />}
          {linkToMetrics && <Link to={linkToMetrics}>{renderText}</Link>}
        </Bullseye>
      )}
    </StateHandler>
  );
};

export default ComponentReady;
