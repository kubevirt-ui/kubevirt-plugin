import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import migrationPoliciesEmptyState from 'images/migrationPoliciesEmptyState.png';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { migrationPoliciesPageBaseURL } from '../../utils/constants';

const MigrationPoliciesEmptyState: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <EmptyState variant={EmptyStateVariant.xs}>
      <EmptyStateIcon icon={() => <img src={migrationPoliciesEmptyState} />} />
      <Title headingLevel="h4" size="lg">
        {t('No MigrationPolicies are defined yet')}
      </Title>
      <EmptyStateBody>
        <Trans t={t} ns="plugin__kubevirt-plugin">
          Click <b>Create MigrationPolicy</b> to create you first policy
        </Trans>
      </EmptyStateBody>
      <EmptyStatePrimary>
        <Link to={`${migrationPoliciesPageBaseURL}/form`}>
          <Button variant={ButtonVariant.primary}>{t('Create MigrationPolicy')}</Button>
        </Link>
      </EmptyStatePrimary>
      <EmptyStateSecondaryActions>
        <a
          href="https://access.redhat.com/documentation/en-us/openshift_container_platform/4.11/html/virtualization/live-migration#virt-configuring-live-migration-policies"
          target="_blank"
          rel="noreferrer"
        >
          {t('View documentation')} <ExternalLinkAltIcon />
        </a>
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};

export default MigrationPoliciesEmptyState;
