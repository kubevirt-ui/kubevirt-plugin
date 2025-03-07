import React, { FC } from 'react';

import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, EmptyState, EmptyStateBody, EmptyStateFooter } from '@patternfly/react-core';

import { CustomConnectComponentProps } from './utils/VncConsoleTypes';

const VncConnect: FC<CustomConnectComponentProps> = ({ connect, isConnecting }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      {!isConnecting && (
        <EmptyState>
          <EmptyStateBody>{t('Click Connect to open the VNC console.')}</EmptyStateBody>
          <EmptyStateFooter>
            <Button onClick={connect} variant="primary">
              {t('Connect')}
            </Button>
          </EmptyStateFooter>
        </EmptyState>
      )}
      {isConnecting && <LoadingEmptyState bodyContents={t('Connecting')} />})
    </>
  );
};

export default VncConnect;
