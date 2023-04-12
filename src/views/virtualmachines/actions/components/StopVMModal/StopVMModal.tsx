import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ButtonVariant, Stack, StackItem } from '@patternfly/react-core';
import { stopVM } from '@virtualmachines/actions/actions';

import { DEFAULT_GRACE_PERIOD } from './constants';
import { GracePeriodInput } from '@kubevirt-utils/components/GracePeriodInput/GracePeriodInput';

type StopVMModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
};

const StopVMModal: FC<StopVMModalProps> = ({ vm, isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();
  const [gracePeriodCheckbox, setGracePeriodCheckbox] = useState<boolean>(false);
  const [gracePeriodSeconds, setGracePeriodSeconds] = useState<number>(
    vm?.spec?.template?.spec?.terminationGracePeriodSeconds || DEFAULT_GRACE_PERIOD,
  );

  const onSubmit = async (updatedVM: V1VirtualMachine) => {
    await stopVM(
      updatedVM,
      gracePeriodCheckbox
        ? { apiVersion: 'v1', kind: 'StopOptions', gracePeriod: gracePeriodSeconds }
        : null,
    );
  };

  return (
    <TabModal<V1VirtualMachine>
      onClose={onClose}
      isOpen={isOpen}
      obj={vm}
      onSubmit={onSubmit}
      headerText={t('Stop VirtualMachine?')}
      submitBtnText={t('Stop')}
      submitBtnVariant={ButtonVariant.danger}
    >
      <Stack hasGutter>
        <StackItem>
          <ConfirmActionMessage obj={vm} action="stop" />
        </StackItem>
        <GracePeriodInput
          isChecked={gracePeriodCheckbox}
          onCheckboxChange={setGracePeriodCheckbox}
          gracePeriodSeconds={gracePeriodSeconds}
          setGracePeriodSeconds={setGracePeriodSeconds}
        />
      </Stack>
    </TabModal>
  );
};

export default StopVMModal;
