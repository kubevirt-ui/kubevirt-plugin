import React, { ComponentType, FC } from 'react';
import { Link } from 'react-router';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateStatus,
  EmptyStateVariant,
  Spinner,
} from '@patternfly/react-core';

type MigrationProgressDisplayProps = {
  basePath?: string;
  cancelError: Error | null;
  failedVmCount: number;
  fetchingError: unknown;
  hasFailed: boolean;
  isExternal: boolean;
  migrationCompleted: boolean;
  migrationHeading: string;
  migrationIcon: ComponentType;
  migrationStatus: EmptyStateStatus;
  onCancelMigration: () => void;
  onClose: () => void;
};

const MigrationProgressDisplay: FC<MigrationProgressDisplayProps> = ({
  basePath,
  cancelError,
  failedVmCount,
  fetchingError,
  hasFailed,
  isExternal,
  migrationCompleted,
  migrationHeading,
  migrationIcon: MigrationIcon,
  migrationStatus,
  onCancelMigration,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState
      headingLevel="h3"
      icon={MigrationIcon}
      status={migrationStatus}
      titleText={migrationHeading}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        <div aria-live="polite" role="status">
          {hasFailed && !migrationCompleted && (
            <Content component={ContentVariants.p}>
              {t('{{vmCount}} VirtualMachine storage migration(s) failed.', {
                vmCount: failedVmCount,
              })}
            </Content>
          )}
          {!migrationCompleted && !hasFailed && (
            <>
              <Spinner size="lg" />
              <Content className="pf-v6-u-mt-sm" component={ContentVariants.p}>
                {t('Migration in progress...')}
              </Content>
            </>
          )}
        </div>
      </EmptyStateBody>

      <ErrorAlert error={fetchingError || cancelError} />

      <EmptyStateFooter>
        <EmptyStateActions>
          {migrationCompleted || hasFailed ? (
            <Button onClick={onClose} variant={ButtonVariant.primary}>
              {t('Close')}
            </Button>
          ) : (
            <Button onClick={onCancelMigration} variant={ButtonVariant.link}>
              {t('Cancel')}
            </Button>
          )}
        </EmptyStateActions>
        {basePath && (
          <EmptyStateActions>
            {isExternal ? (
              <ExternalLink href={basePath} text={t('View storage migrations')} />
            ) : (
              <Button
                {...({
                  component: Link,
                  onClick: onClose,
                  to: basePath,
                  variant: ButtonVariant.link,
                } as React.ComponentProps<typeof Button>)}
              >
                {t('View storage migrations')}
              </Button>
            )}
          </EmptyStateActions>
        )}
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default MigrationProgressDisplay;
