import React, { FC } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getMigrationPhase } from '@kubevirt-utils/resources/vmim/selectors';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import {
  Alert,
  AlertActionCloseButton,
  Button,
  ButtonVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { cancelMigration } from '@virtualmachines/actions/actions';

import ComputeMigrationModal from '../../ComputeMigrationModal';

import './FailedMigrationAlert.scss';

type FailedMigrationAlertProps = {
  vm: V1VirtualMachine;
  vmim: V1VirtualMachineInstanceMigration;
};

const FailedMigrationAlert: FC<FailedMigrationAlertProps> = ({ vm, vmim }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  if (!vmim || getMigrationPhase(vmim) !== vmimStatuses.Failed) return null;

  return (
    <Alert
      actionClose={<AlertActionCloseButton />}
      className="failed-migration-alert"
      isInline
      title={t('Migration failed')}
      variant="warning"
    >
      <Stack className="failed-migration-alert__content" hasGutter>
        <StackItem>
          {t('The selected Node is unavailable. You can retry selecting a different one.')}
        </StackItem>
        <StackItem>
          <Button
            onClick={() =>
              createModal(({ isOpen, onClose }) => (
                <ComputeMigrationModal isOpen={isOpen} onClose={onClose} vm={vm} />
              ))
            }
            variant={ButtonVariant.primary}
          >
            {t('Select different Node')}
          </Button>
          <Button onClick={() => cancelMigration(vmim)} variant={ButtonVariant.link}>
            {t('Cancel migration')}
          </Button>
        </StackItem>
      </Stack>
    </Alert>
  );
};

export default FailedMigrationAlert;
