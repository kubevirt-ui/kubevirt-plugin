import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

import Loading from '../Loading/Loading';

type StateHandlerProps = {
  error?: any;
  loaded: boolean;
};

const StateHandler: FC<StateHandlerProps> = ({ children, error, loaded }) => {
  const { t } = useKubevirtTranslation();

  if (error) {
    return (
      <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
        {error?.message}
      </Alert>
    );
  }

  if (!loaded) {
    return <Loading />;
  }

  return <>{children}</>;
};

export default StateHandler;
