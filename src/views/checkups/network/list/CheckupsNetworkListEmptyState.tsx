import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { NetworkIcon } from '@patternfly/react-icons';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import { installOrRemoveCheckupsNetworkPermissions } from '../utils/utils';

import './checkups-network-list-empty-state.scss';

const CheckupsNetworkListEmptyState = ({ isPermitted, nadsInNamespace }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [namespace] = useActiveNamespace();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <EmptyState variant={EmptyStateVariant.large}>
      <EmptyStateIcon icon={NetworkIcon} />
      <Title headingLevel="h4" size="lg">
        {t('No network latency checkups yet')}
      </Title>
      <EmptyStateBody>
        {t('To get started, install permissions and then run a checkup')}
      </EmptyStateBody>
      <EmptyStatePrimary>
        <Button
          isDisabled={
            !isPermitted ||
            !nadsInNamespace ||
            isLoading ||
            namespace === ALL_NAMESPACES_SESSION_KEY
          }
          onClick={() => history.push(createURL('form', history.location.pathname))}
        >
          {t('Run checkup')}
        </Button>
      </EmptyStatePrimary>
      <EmptyStateSecondaryActions>
        <Button
          onClick={async () => {
            setIsLoading(true);
            await installOrRemoveCheckupsNetworkPermissions(namespace, isPermitted);
            setIsLoading(false);
          }}
          isDisabled={!nadsInNamespace || isLoading}
          isLoading={isLoading}
          variant={isLoading ? ButtonVariant.plain : ButtonVariant.secondary}
        >
          {!isLoading && isPermitted ? t('Remove permissions') : t('Install permissions')}
        </Button>
      </EmptyStateSecondaryActions>
      {!nadsInNamespace && (
        <Title className="CheckupsNetworkListEmptyState--title__namespace" headingLevel="h5">
          {t('Please add a NetworkAttachmentDefinition to this namespace in order to use checkups')}
        </Title>
      )}
      <EmptyStateSecondaryActions>
        <ExternalLink
          href={
            'https://docs.openshift.com/container-platform/4.13/virt/support/monitoring/virt-running-cluster-checkups.html#virt-measuring-latency-vm-secondary-network_virt-running-cluster-checkups'
          }
          text={t('Learn about network checkups')}
        />
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};

export default CheckupsNetworkListEmptyState;
