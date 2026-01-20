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
import { getStorageMigrationStatusLabel } from './utils/utils';

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
    completedMigrationTimestamp,
    creationTimestamp,
    error: fetchingError,
    status,
    watchStorageMigrationPlan,
  } = useProgressMigration(storageMigrationPlan);

  const migrationCompleted = status === STATUS_COMPLETED;

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
          <DescriptionListTerm>
            {getStorageMigrationStatusLabel(watchStorageMigrationPlan)}
          </DescriptionListTerm>
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
                <br />
                <Timestamp timestamp={completedMigrationTimestamp} />
              </>
            )}

            <ErrorAlert error={fetchingError} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      <ActionList>
        <ActionListItem className="migration-status__view-report">
          <Link
            to={`/k8s/ns/${getNamespace(storageMigrationPlan)}/${modelToRef(
              MultiNamespaceVirtualMachineStorageMigrationPlanModel,
            )}`}
            onClick={onClose}
          >
            {t('View storage migrations')}
          </Link>
        </ActionListItem>
      </ActionList>
    </div>
  );
};

export default VirtualMachineMigrationStatus;
