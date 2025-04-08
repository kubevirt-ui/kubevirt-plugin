import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionList,
  ActionListItem,
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Content,
  Title,
} from '@patternfly/react-core';
import { CloseIcon, WarningTriangleIcon } from '@patternfly/react-icons';
import { rollbackStorageMigration } from '@virtualmachines/actions/actions';

import { MigMigration, MigMigrationModel } from './constants';

type VirtualMachineMigrationRollbackProps = {
  migMigration?: MigMigration;
  onClose: () => void;
  onContinue: () => void;
  vm?: V1VirtualMachine;
};

const VirtualMachineMigrationRollback: FC<VirtualMachineMigrationRollbackProps> = ({
  migMigration,
  onClose,
  onContinue,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const [loadingRollback, setLoadingRollback] = useState(false);
  const [errorRollback, setErrorRollback] = useState<Error>();

  const rollback = async () => {
    setLoadingRollback(true);

    try {
      vm
        ? await rollbackStorageMigration(vm)
        : await k8sPatch({
            data: [{ op: 'replace', path: '/spec/rollback', value: 'true' }],
            model: MigMigrationModel,
            resource: migMigration,
          });
      onClose();
    } catch (apiError) {
      setErrorRollback(errorRollback);
    } finally {
      setLoadingRollback(false);
    }
  };

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
          <h2 className="pf-v6-c-wizard__title-text">{t('Migrate VirtualMachine storage')}</h2>
        </div>
        <div className="pf-v6-c-wizard__description">
          {t('Migrate VirtualMachine storage to a different StorageClass.')}
        </div>
      </header>

      <div className="migration-status__body">
        <Title headingLevel="h2">
          <WarningTriangleIcon color="var(--pf-t--global--icon--color--status--warning--default)" />{' '}
          {t('Stop migration')}
        </Title>

        <Content component="p">
          {t('Are you sure you want to stop the VirtualMachine workloads?')}
        </Content>
        <Content component="p">
          {t(
            'Stopping the migration will cancel any remaining migrations that are scheduled or currently in progress',
          )}
        </Content>

        <Content component="p">
          <Trans t={t}>
            Select <strong>Rollback</strong> to return any completed migration to the original
            StorageClass.
          </Trans>
        </Content>

        {errorRollback && (
          <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
            {errorRollback?.message}
          </Alert>
        )}
      </div>
      <ActionList>
        <ActionListItem>
          <Button isLoading={loadingRollback} onClick={rollback}>
            {t('Rollback')}
          </Button>
        </ActionListItem>
        <ActionListItem>
          <Button onClick={onContinue} variant={ButtonVariant.link}>
            {t('Continue')}
          </Button>
        </ActionListItem>
      </ActionList>
    </div>
  );
};

export default VirtualMachineMigrationRollback;
