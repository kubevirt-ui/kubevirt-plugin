import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import migrationPoliciesEmptyState from 'images/migrationPoliciesEmptyState.svg';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';

import MigrationPoliciesCreateButton from '../MigrationPoliciesCreateButton/MigrationPoliciesCreateButton';

import './MigrationPoliciesEmptyState.scss';

type MigrationPoliciesEmptyStateProps = {
  kind: string;
};

const MigrationPoliciesEmptyState: FC<MigrationPoliciesEmptyStateProps> = ({ kind }) => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState variant={EmptyStateVariant.xs}>
      <EmptyStateIcon
        icon={() => <img className="emptyStateImg" src={migrationPoliciesEmptyState} />}
      />
      <Title headingLevel="h4" size="lg">
        {t('No MigrationPolicies are defined yet')}
      </Title>
      <EmptyStateBody>
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Click <b>Create MigrationPolicy</b> to create your first policy
        </Trans>
      </EmptyStateBody>
      <EmptyStatePrimary>
        <MigrationPoliciesCreateButton kind={kind} />
      </EmptyStatePrimary>
      <EmptyStateSecondaryActions>
        <ExternalLink
          href={
            'https://access.redhat.com/documentation/en-us/openshift_container_platform/4.11/html/virtualization/live-migration#virt-configuring-live-migration-policies'
          }
          text={t('View documentation')}
        />
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};

export default MigrationPoliciesEmptyState;
