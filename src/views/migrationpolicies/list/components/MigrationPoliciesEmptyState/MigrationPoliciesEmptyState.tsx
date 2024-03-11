import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import migrationPoliciesEmptyState from 'images/migrationPoliciesEmptyState.svg';

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

import MigrationPoliciesCreateButton from '../MigrationPoliciesCreateButton/MigrationPoliciesCreateButton';

const MigrationPoliciesEmptyState: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState variant={EmptyStateVariant.xs}>
      <EmptyStateHeader
        icon={
          <EmptyStateIcon
            icon={() => <img className="emptyStateImg" src={migrationPoliciesEmptyState} />}
          />
        }
        headingLevel="h4"
        titleText={<>{t('No MigrationPolicies are defined yet')}</>}
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
        <EmptyStateActions>
          <ExternalLink
            href={
              'https://access.redhat.com/documentation/en-us/openshift_container_platform/4.11/html/virtualization/live-migration#virt-configuring-live-migration-policies'
            }
            text={t('View documentation')}
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default MigrationPoliciesEmptyState;
