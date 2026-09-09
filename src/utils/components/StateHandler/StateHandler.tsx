import React, { type FC, type ReactNode } from 'react';

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

type StateHandlerError = Error & { response?: { status?: number } };

type StateHandlerProps = {
  children?: ReactNode;
  error?: unknown;
  hasData: boolean;
  loaded: boolean;
  showSkeletonLoading?: boolean;
  withBullseye?: boolean;
};

const toStateHandlerError = (error: unknown): StateHandlerError | undefined => {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'object' && 'message' in error) {
    return error as StateHandlerError;
  }

  return new Error(String(error));
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
  const stateHandlerError = toStateHandlerError(error);

  if (stateHandlerError) {
    const status = stateHandlerError.response?.status;

    if (status === 403) {
      return <AccessDenied message={stateHandlerError.message} />;
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
        {stateHandlerError.message}
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
