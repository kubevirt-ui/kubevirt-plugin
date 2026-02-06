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

import ListSkeleton from './ListSkeleton';

type StateHandlerProps = {
  error?: any;
  hasData: boolean;
  loaded: boolean;
  showSkeletonLoading?: boolean;
  withBullseye?: boolean;
};

const StateHandler: FC<StateHandlerProps> = ({
  children,
  error,
  hasData,
  loaded,
  showSkeletonLoading = false,
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

  const LoadingComponent = showSkeletonLoading ? ListSkeleton : Loading;

  if (!loaded && !hasData) {
    return withBullseye ? (
      <Bullseye>
        <LoadingComponent />
      </Bullseye>
    ) : (
      <LoadingComponent />
    );
  }

  return <>{children}</>;
};

export default StateHandler;
