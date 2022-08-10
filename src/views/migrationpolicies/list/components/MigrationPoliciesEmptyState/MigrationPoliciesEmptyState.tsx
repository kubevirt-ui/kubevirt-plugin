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
        <Button
          variant={ButtonVariant.link}
          // onClick={() => history.push(MigrationPolicyDocURL)} waiting to get URL from docs team
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
        >
          {t('View documentation')}
        </Button>
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};

export default MigrationPoliciesEmptyState;
