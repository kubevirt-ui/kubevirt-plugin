import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToRef } from '@kubevirt-utils/models';
import {
  DEFAULT_MIGRATION_NAMESPACE,
  MigMigration,
  MigMigrationStatuses,
  MigPlanModel,
} from '@kubevirt-utils/resources/migrations/constants';
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

import useProgressMigration from './hooks/useProgressMigration';
import { getMigMigrationStatusLabel } from './utils/utils';
import VirtualMachineMigrationRollback from './VirtualMachineMigrationRollback';

type VirtualMachineMigrationStatusProps = {
  migMigration: MigMigration;
  onClose: () => void;
};

const VirtualMachineMigrationStatus: FC<VirtualMachineMigrationStatusProps> = ({
  migMigration,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const [rollbacking, setRollbacking] = useState(false);

  const {
    completedMigrationTimestamp,
    creationTimestamp,
    error: fetchingError,
    status,
  } = useProgressMigration(migMigration);

  const migrationCompleted = status === MigMigrationStatuses.Completed;

  if (rollbacking)
    return (
      <VirtualMachineMigrationRollback
        migMigration={migMigration}
        onClose={onClose}
        onContinue={() => setRollbacking(false)}
      />
    );

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
          <h2 className="pf-v6-c-wizard__title-text">{t('Migrate VirtualMachines storage')}</h2>
        </div>
        <div className="pf-v6-c-wizard__description">
          {t('Migrate VirtualMachine storage to a different StorageClass.')}
        </div>
      </div>

      <DescriptionList className="migration-status__body">
        <DescriptionListGroup>
          <DescriptionListTerm>{getMigMigrationStatusLabel(status)}</DescriptionListTerm>
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
        <ActionListItem>
          {!migrationCompleted && (
            <Button onClick={() => setRollbacking(true)} variant={ButtonVariant.secondary}>
              {t('Stop')}
            </Button>
          )}
        </ActionListItem>
        <ActionListItem className="migration-status__view-report">
          <Link
            onClick={onClose}
            to={`/k8s/ns/${DEFAULT_MIGRATION_NAMESPACE}/${modelToRef(MigPlanModel)}`}
          >
            {t('View storage migrations')}
          </Link>
        </ActionListItem>
      </ActionList>
    </div>
  );
};

export default VirtualMachineMigrationStatus;
