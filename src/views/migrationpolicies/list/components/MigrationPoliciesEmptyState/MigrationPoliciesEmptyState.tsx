import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { MigrationIcon } from '@patternfly/react-icons';

import MigrationPoliciesCreateButton from '../MigrationPoliciesCreateButton/MigrationPoliciesCreateButton';

const MigrationPoliciesEmptyState: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader
        headingLevel="h4"
        icon={<EmptyStateIcon icon={MigrationIcon} />}
        titleText={<>{t('No MigrationPolicies found')}</>}
      />

      <EmptyStateBody>
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Click <b>Create MigrationPolicy</b> to create your first policy
        </Trans>
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          <MigrationPoliciesCreateButton />
        </EmptyStateActions>
        <br />
        <EmptyStateActions>
          <ExternalLink
            href="https://access.redhat.com/documentation/en-us/openshift_container_platform/4.15/html/virtualization/live-migration#live-migration-policies"
            text={t('Learn more about MigrationPolicies')}
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default MigrationPoliciesEmptyState;
