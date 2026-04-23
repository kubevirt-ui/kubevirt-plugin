import React, { FC, PropsWithChildren } from 'react';
import { Link } from 'react-router';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoDataAvailableMessage } from '@kubevirt-utils/utils/utils';
import { Bullseye } from '@patternfly/react-core';

type ComponentReadyProps = PropsWithChildren<{
  error?: Error | unknown;
  isLoading?: boolean;
  isReady: boolean;
  linkToMetrics?: string;
  text?: string;
}>;

const ComponentReady: FC<ComponentReadyProps> = ({
  children,
  error,
  isLoading,
  isReady,
  linkToMetrics,
  text,
}) => {
  const { t } = useKubevirtTranslation();

  const renderText = text || getNoDataAvailableMessage(t);

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
