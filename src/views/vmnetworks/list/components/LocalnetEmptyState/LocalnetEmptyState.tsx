import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import useCanCreateVMNetwork from 'src/views/vmnetworks/hooks/useCanCreateVMNetwork';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';

import NoPhysicalNetworkAlert from './NoPhysicalNetworkAlert';

type LocalnetEmptyStateProps = {
  onCreate: () => void;
};

const LocalnetEmptyState: FC<LocalnetEmptyStateProps> = ({ onCreate }) => {
  const { t } = useKubevirtTranslation();

  const kind = t('OVN localnet network');
  const createButtonText = t('Create network');

  const { canCreate, showNoPhysicalNetworkAlert } = useCanCreateVMNetwork();

  return (
    <EmptyState
      headingLevel="h4"
      icon={AddCircleOIcon}
      titleText={t('No {{kind}} found', { kind })}
    >
      <EmptyStateBody>
        {showNoPhysicalNetworkAlert ? (
          <NoPhysicalNetworkAlert />
        ) : (
          <Trans t={t}>
            Click <b>{{ createButtonText }}</b> to create your first {{ kind }}
          </Trans>
        )}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button isDisabled={!canCreate} onClick={onCreate}>
            {createButtonText}
          </Button>
        </EmptyStateActions>
        <EmptyStateActions>
          <ExternalLink href={documentationURL.NETWORKING}>
            {t('Learn more about {{ kind }}', { kind })}
          </ExternalLink>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default LocalnetEmptyState;
