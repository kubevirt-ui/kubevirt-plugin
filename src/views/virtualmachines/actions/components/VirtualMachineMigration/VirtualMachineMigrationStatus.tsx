import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  modelToRef,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { STATUS_COMPLETED } from '@kubevirt-utils/resources/migrations/constants';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Spinner,
} from '@patternfly/react-core';
import { CloseIcon } from '@patternfly/react-icons';

import useProgressMigration from './hooks/useProgressMigration';
import { getFailedMigrations, getMigrationStatusProps } from './utils/utils';

type VirtualMachineMigrationStatusProps = {
  onClose: () => void;
  storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan;
};

const VirtualMachineMigrationStatus: FC<VirtualMachineMigrationStatusProps> = ({
  onClose,
  storageMigrationPlan,
}) => {
  const { t } = useKubevirtTranslation();

  const {
    error: fetchingError,
    status,
    watchStorageMigrationPlan,
  } = useProgressMigration(storageMigrationPlan);

  const migrationCompleted = status === STATUS_COMPLETED;
  const failedMigrations = getFailedMigrations(watchStorageMigrationPlan);
  const hasFailed = failedMigrations.length > 0;
  const {
    heading,
    icon,
    status: emptyStateStatus,
  } = getMigrationStatusProps(migrationCompleted, hasFailed);

  return (
    <div className="pf-v6-c-wizard migration-status">
      <div className="pf-v6-c-wizard__header">
        <div className="pf-v6-c-wizard__close">
          <Button
            aria-label={t('Close')}
            icon={<CloseIcon />}
            onClick={onClose}
            variant={ButtonVariant.plain}
          />
        </div>
        <div className="pf-v6-c-wizard__title">
          <h2 className="pf-v6-c-wizard__title-text">{t('Migrate VirtualMachine storage')}</h2>
        </div>
        <div className="pf-v6-c-wizard__description">
          {t('Migrate VirtualMachine storage to a different StorageClass.')}
        </div>
      </div>

      <div className="migration-status__body">
        <EmptyState icon={icon} status={emptyStateStatus} variant={EmptyStateVariant.lg}>
          <EmptyStateBody>
            <Content component={ContentVariants.h3}>{heading}</Content>
            {hasFailed && !migrationCompleted && (
              <Content component={ContentVariants.p}>
                {t('{{count}} VirtualMachine storage migration(s) failed.', {
                  count: failedMigrations.length,
                })}
              </Content>
            )}
            {!migrationCompleted && !hasFailed && <Spinner size="lg" />}
          </EmptyStateBody>

          <ErrorAlert error={fetchingError} />

          <EmptyStateFooter>
            <EmptyStateActions>
              {migrationCompleted || hasFailed ? (
                <Button onClick={onClose} variant={ButtonVariant.primary}>
                  {t('Close')}
                </Button>
              ) : (
                <Button onClick={onClose} variant={ButtonVariant.link}>
                  {t('Cancel')}
                </Button>
              )}
            </EmptyStateActions>
            <EmptyStateActions>
              <Link
                to={`/k8s/ns/${getNamespace(storageMigrationPlan)}/${modelToRef(
                  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
                )}`}
                onClick={onClose}
              >
                {t('View storage migrations')}
              </Link>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </div>
    </div>
  );
};

export default VirtualMachineMigrationStatus;
