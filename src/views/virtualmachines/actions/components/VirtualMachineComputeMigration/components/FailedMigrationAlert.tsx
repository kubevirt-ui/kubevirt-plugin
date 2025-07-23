import React, { FC } from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertActionCloseButton,
  Button,
  ButtonVariant,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import ComputeMigrationModal from '../ComputeMigrationModal';

type FailedMigrationAlertProps = {
  vm: V1VirtualMachine;
  vmim: V1VirtualMachineInstanceMigration;
};

const FailedMigrationAlert: FC<FailedMigrationAlertProps> = ({ vm, vmim }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  if (vmim) return null;

  return (
    <Alert
      actionClose={
        <AlertActionCloseButton onClose={() => kubevirtConsole.log('Clicked the close button')} />
      }
      isInline
      title={t('Migration failed')}
      variant="warning"
    >
      <Stack>
        <StackItem>
          {t('The selected Node is unavailable. You can retry selecting a different one.')}
        </StackItem>
        <StackItem>
          <Split>
            <SplitItem>
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
            </SplitItem>
            <SplitItem>
              <Button variant={ButtonVariant.link}>{t('Cancel migration')}</Button>
            </SplitItem>
          </Split>
        </StackItem>
      </Stack>
    </Alert>
  );
};

export default FailedMigrationAlert;
