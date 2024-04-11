import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { NetworkIcon } from '@patternfly/react-icons';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import { installOrRemoveCheckupsNetworkPermissions } from '../utils/utils';

import './checkups-network-list-empty-state.scss';

const CheckupsNetworkListEmptyState = ({ isPermitted, nadsInNamespace }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [namespace] = useActiveNamespace();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader
        headingLevel="h4"
        icon={<EmptyStateIcon icon={NetworkIcon} />}
        titleText={<>{t('No network latency checkups found')}</>}
      />

      <EmptyStateBody>
        {t('To get started, install permissions and then run a checkup')}
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            isDisabled={
              !isPermitted ||
              !nadsInNamespace ||
              isLoading ||
              namespace === ALL_NAMESPACES_SESSION_KEY
            }
            onClick={() => navigate(createURL('form', location.pathname))}
          >
            {t('Run checkup')}
          </Button>
        </EmptyStateActions>
        <EmptyStateActions>
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
        </EmptyStateActions>
        {!nadsInNamespace && (
          <p className="CheckupsNetworkListEmptyState--title__namespace text-muted">
            {t('Add a NetworkAttachmentDefinition to this namespace in order to use checkups')}
          </p>
        )}
        <EmptyStateActions>
          <ExternalLink
            href="https://docs.openshift.com/container-platform/4.15/virt/monitoring/virt-running-cluster-checkups.html#virt-measuring-latency-vm-secondary-network_virt-running-cluster-checkups"
            text={t('Learn more about network latency checkups')}
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default CheckupsNetworkListEmptyState;
