import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Alert,
  AlertVariant,
  Bullseye,
  Panel,
  PanelMain,
  PanelMainBody,
  Title,
} from '@patternfly/react-core';

import AccessDenied from '../AccessDenied/AccessDenied';
import Loading from '../Loading/Loading';

type StateHandlerProps = {
  error?: any;
  hasData: boolean;
  loaded: boolean;
  withBullseye?: boolean;
};

const StateHandler: FC<StateHandlerProps> = ({
  children,
  error,
  hasData,
  loaded,
  withBullseye = false,
}) => {
  const { t } = useKubevirtTranslation();

  if (error) {
    const status = error?.response?.status;

    if (status === 403) {
      return <AccessDenied>{error.message}</AccessDenied>;
    }

    if (status === 404) {
      return (
        <Panel>
          <PanelMain>
            <PanelMainBody>
              <Title className="pf-v6-u-text-align-center" headingLevel="h2">
                {t('404: Not Found')}
              </Title>
            </PanelMainBody>
          </PanelMain>
        </Panel>
      );
    }
    return (
      <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
        {error?.message}
      </Alert>
    );
  }

  if (!loaded && !hasData) {
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
