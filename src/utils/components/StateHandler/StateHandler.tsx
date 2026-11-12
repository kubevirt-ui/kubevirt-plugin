import { type FC, type ReactNode } from 'react';

import { isForbiddenError } from '@kubevirt-utils/errors/clusterMetricsAccess';
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

type StateHandlerError = {
  message?: string;
  response?: { status?: number };
};

type StateHandlerProps = {
  children?: ReactNode;
  error?: StateHandlerError | unknown;
  hasData: boolean;
  /** Use compact Access Restricted warning (Overview cards). */
  inlineAccessDenied?: boolean;
  loaded: boolean;
  showSkeletonLoading?: boolean;
  withBullseye?: boolean;
};

const getErrorMessage = (error: unknown): string => {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : '';
  }
  return '';
};

const StateHandler: FC<StateHandlerProps> = ({
  children,
  error,
  hasData,
  inlineAccessDenied = false,
  loaded,
  showSkeletonLoading = false,
  withBullseye = false,
}) => {
  const { t } = useKubevirtTranslation();

  if (error) {
    if (isForbiddenError(error)) {
      return <AccessDenied inline={inlineAccessDenied} message={getErrorMessage(error)} />;
    }

    const status =
      typeof error === 'object' && 'response' in error
        ? (error as StateHandlerError).response?.status
        : undefined;

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
        {getErrorMessage(error)}
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
