import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import migrationPoliciesEmptyState from 'images/migrationPoliciesEmptyState.svg';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';

import MigrationPoliciesCreateButton from '../MigrationPoliciesCreateButton/MigrationPoliciesCreateButton';

import './MigrationPoliciesEmptyState.scss';

export type MigrationPoliciesEmptyStateProps = {
  loadError?: boolean;
};

const MigrationPoliciesEmptyState: FC<MigrationPoliciesEmptyStateProps> = ({
  loadError = false,
}) => {
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
          {loadError && (
            <Popover
              bodyContent={() =>
                t(
                  'To perform this action you must get permission from your Organization Administrator.',
                )
              }
              aria-label={'Help'}
              position={PopoverPosition.right}
            >
              <div className="MigrationPoliciesEmptyState__button">
                <Button>{t('Create MigrationPolicy')}</Button>
              </div>
            </Popover>
          )}
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
