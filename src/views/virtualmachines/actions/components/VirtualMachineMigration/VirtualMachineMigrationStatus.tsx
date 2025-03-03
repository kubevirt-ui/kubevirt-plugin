import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getMigrationPod } from '@kubevirt-utils/resources/vmim/selectors';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
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

import useCurrentStorageMigration from './hooks/useCurrentStorageMigration';
import { getMigrationStatusLabel, getMigrationSuccessTimestamp } from './utils';
import VirtualMachineMigrationRollback from './VirtualMachineMigrationRollback';

type VirtualMachineMigrationStatusProps = {
  onClose: () => void;
  vm: V1VirtualMachine;
};

const VirtualMachineMigrationStatus: FC<VirtualMachineMigrationStatusProps> = ({ onClose, vm }) => {
  const { t } = useKubevirtTranslation();
  const vmim = useCurrentStorageMigration(vm);
  const [rollbacking, setRollbacking] = useState(false);

  const migrationPod = getMigrationPod(vmim);
  const migrationLogURL = migrationPod && `/k8s/ns/default/pods/${migrationPod}/logs`;

  const migrationCompleted = vmimStatuses.Succeeded === vmim?.status?.phase;

  if (rollbacking)
    return (
      <VirtualMachineMigrationRollback
        onClose={onClose}
        onContinue={() => setRollbacking(false)}
        vm={vm}
      />
    );

  return (
    <div className="pf-v5-c-wizard migration-status">
      <div className="pf-v5-c-wizard__header">
        <div className="pf-v5-c-wizard__close">
          <Button aria-label={t('Close')} onClick={onClose} variant={ButtonVariant.plain}>
            <CloseIcon />
          </Button>
        </div>
        <div className="pf-v5-c-wizard__title">
          <h2 className="pf-v5-c-wizard__title-text">{t('Migrate VirtualMachine storage')}</h2>
        </div>
        <div className="pf-v5-c-wizard__description">
          {t('Migrate VirtualMachine storage to a different StorageClass.')}
        </div>
      </div>

      <DescriptionList className="migration-status__body">
        <DescriptionListGroup>
          <DescriptionListTerm>{getMigrationStatusLabel(vmim)}</DescriptionListTerm>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>{t('Started on')}</DescriptionListTerm>
          <DescriptionListDescription>
            {vmim?.metadata?.creationTimestamp ? (
              <Timestamp timestamp={vmim?.metadata?.creationTimestamp} />
            ) : (
              t('Not started yet')
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
          <DescriptionListDescription>
            {vmim?.status?.phase || t('Requested')}

            {migrationCompleted && (
              <>
                {t('Migrated at')} <Timestamp timestamp={getMigrationSuccessTimestamp(vmim)} />{' '}
              </>
            )}
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
        <ActionListItem>
          <Button onClick={onClose} variant={ButtonVariant.link}>
            {t('Cancel')}
          </Button>
        </ActionListItem>
        {migrationLogURL && (
          <ActionListItem className="migration-status__view-report">
            <ExternalLink href={migrationLogURL}>{t('View report')}</ExternalLink>
          </ActionListItem>
        )}
      </ActionList>
    </div>
  );
};

export default VirtualMachineMigrationStatus;
