import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { MigrationIcon } from '@patternfly/react-icons';

import MigrationPoliciesCreateButton from '../MigrationPoliciesCreateButton/MigrationPoliciesCreateButton';

const MigrationPoliciesEmptyState: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ListPageHeader title={t('MigrationPolicies')} />

      <ListPageBody>
        <EmptyState
          headingLevel="h4"
          icon={MigrationIcon}
          titleText={<>{t('No MigrationPolicies found')}</>}
          variant={EmptyStateVariant.lg}
        >
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
                href={documentationURL.MIGRATION_POLICIES}
                text={t('Learn more about MigrationPolicies')}
              />
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </ListPageBody>
    </>
  );
};

export default MigrationPoliciesEmptyState;
