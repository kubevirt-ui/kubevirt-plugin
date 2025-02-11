import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ActionList,
  ActionListItem,
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Text,
  Title,
} from '@patternfly/react-core';
import { CloseIcon, WarningTriangleIcon } from '@patternfly/react-icons';
import { rollbackStorageMigration } from '@virtualmachines/actions/actions';

type VirtualMachineMigrationRollbackProps = {
  onClose: () => void;
  onContinue: () => void;
  vm: V1VirtualMachine;
};

const VirtualMachineMigrationRollback: FC<VirtualMachineMigrationRollbackProps> = ({
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
      await rollbackStorageMigration(vm);
      onClose();
    } catch (apiError) {
      setErrorRollback(errorRollback);
    } finally {
      setLoadingRollback(false);
    }
  };

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

      <div className="migration-status__body">
        <Title headingLevel="h2">
          <WarningTriangleIcon color="var(--pf-v5-global--warning-color--100)" />{' '}
          {t('Stop migration')}
        </Title>

        <Text>{t('Are you sure you want to stop the VirtualMachine workloads?')}</Text>
        <Text>
          {t(
            'Stopping the migration will cancel any remaining migrations that are scheduled or currently in progress',
          )}
        </Text>

        <Text>
          <Trans t={t}>
            Select <strong>Rollback</strong> to return any completed migration to the original
            StorageClass.
          </Trans>
        </Text>

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
