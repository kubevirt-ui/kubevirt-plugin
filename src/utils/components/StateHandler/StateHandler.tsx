import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, Bullseye } from '@patternfly/react-core';

import Loading from '../Loading/Loading';

type StateHandlerProps = {
  error?: any;
  loaded: boolean;
  withBullseye?: boolean;
};

const StateHandler: FC<StateHandlerProps> = ({ children, error, loaded, withBullseye = false }) => {
  const { t } = useKubevirtTranslation();

  if (error) {
    return (
      <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
        {error?.message}
      </Alert>
    );
  }

  if (!loaded) {
    return withBullseye ? (
      <Bullseye>
        <Loading />
      </Bullseye>
    ) : (
      <Loading />
    );
  }

  return <>{children}</>;
};

export default StateHandler;
