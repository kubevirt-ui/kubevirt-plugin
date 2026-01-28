import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
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

  if (error) {
    return (
      <Bullseye className="ComponentReady">
        <MutedTextSpan text={t('Error loading data')} />
      </Bullseye>
    );
  }

  if (isLoading) {
    return (
      <Bullseye className="ComponentReady">
        <Loading />
      </Bullseye>
    );
  }

  const renderText = text || t('No data available');
  return isReady ? (
    <>{children}</>
  ) : (
    <Bullseye className="ComponentReady">
      {!linkToMetrics && <MutedTextSpan text={renderText} />}
      {linkToMetrics && <Link to={linkToMetrics}>{renderText}</Link>}
    </Bullseye>
  );
};

export default ComponentReady;
