import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  MigMigration,
  MigMigrationStatuses,
} from '@kubevirt-utils/resources/migrations/migrationsMtcConstants';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionList,
  ActionListItem,
  Button,
  ButtonVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { CloseIcon } from '@patternfly/react-icons';

import useProgressMigrationMtc from './hooks/useProgressMigrationMtc';

const getMigMigrationStatusLabel = (status: string, t: (s: string) => string): string => {
  if (status === MigMigrationStatuses.Failed) return t('Failed');
  if (status === MigMigrationStatuses.Completed) return t('Migration completed successfully');
  return t('In progress');
};

type VirtualMachineMigrationStatusMtcProps = {
  migMigration: MigMigration;
  onClose: () => void;
  vmNamespace?: string;
};

const VirtualMachineMigrationStatusMtc: FC<VirtualMachineMigrationStatusMtcProps> = ({
  migMigration,
  onClose,
  vmNamespace,
}) => {
  const { t } = useKubevirtTranslation();
  const storageMigrationsUrl = vmNamespace
    ? `/k8s/ns/${vmNamespace}/storagemigrations`
    : `/k8s/${ALL_NAMESPACES}/storagemigrations`;

  const {
    completedMigrationTimestamp,
    creationTimestamp,
    error: fetchingError,
    status,
  } = useProgressMigrationMtc(migMigration);

  const migrationCompleted = status === MigMigrationStatuses.Completed;

  return (
    <div className="pf-v6-c-wizard migration-status">
      <header className="pf-v6-c-wizard__header">
        <div className="pf-v6-c-wizard__close">
          <Button
            aria-label={t('Close')}
            icon={<CloseIcon />}
            onClick={onClose}
            variant={ButtonVariant.plain}
          />
        </div>
        <div className="pf-v6-c-wizard__title">
          <h2 className="pf-v6-c-wizard__title-text">{t('Migrate VirtualMachines storage')}</h2>
        </div>
        <div className="pf-v6-c-wizard__description">
          {t('Migrate VirtualMachine storage to a different StorageClass.')}
        </div>
      </header>

      <DescriptionList className="migration-status__body">
        <DescriptionListGroup>
          <DescriptionListTerm>{getMigMigrationStatusLabel(status, t)}</DescriptionListTerm>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>{t('Started on')}</DescriptionListTerm>
          <DescriptionListDescription>
            {creationTimestamp ? <Timestamp timestamp={creationTimestamp} /> : t('Not started yet')}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
          <DescriptionListDescription>
            {status || t('Requested')}
            {migrationCompleted && (
              <>
                {t('Migrated at')} <Timestamp timestamp={completedMigrationTimestamp} />{' '}
              </>
            )}
            <ErrorAlert error={fetchingError} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      <ActionList>
        <ActionListItem className="migration-status__view-report">
          <Link onClick={onClose} to={storageMigrationsUrl}>
            {t('View storage migrations')}
          </Link>
        </ActionListItem>
      </ActionList>
    </div>
  );
};

export default VirtualMachineMigrationStatusMtc;
