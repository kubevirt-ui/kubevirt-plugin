import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
} from '@patternfly/react-core';

type ConfirmVMActionModalProps = {
  action: (vm: V1VirtualMachine) => Promise<string>;
  actionType: string;
  checkToConfirmMessage?: string;
  isOpen: boolean;
  onClose: () => void;
  severityVariant?: 'danger' | 'warning' | undefined;
  vm: V1VirtualMachine;
};

const ConfirmVMActionModal: FC<ConfirmVMActionModalProps> = ({
  action,
  actionType,
  checkToConfirmMessage,
  isOpen,
  onClose,
  severityVariant,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const [isChecked, setIsChecked] = useState<boolean>(!checkToConfirmMessage);

  const submitHandler = () => {
    action(vm);
    onClose();
  };

  return (
    <Modal
      className="confirm-multiple-vm-actions-modal"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitHandler}
      variant={'small'}
    >
      <ModalHeader
        title={t('{{actionType}} VirtualMachine?', { actionType })}
        titleIconVariant={severityVariant}
      />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Trans t={t}>
              Are you sure you want to {{ actionName: actionType?.toLowerCase() }} [
              <strong>{{ vmName: getName(vm) }}</strong>] in namespace [
              <strong>{{ vmNamespace: getNamespace(vm) }}</strong>]?
            </Trans>
          </StackItem>
          <StackItem>
            {checkToConfirmMessage && (
              <Checkbox
                id={`check-to-confirm-action-${actionType}`}
                isChecked={isChecked}
                label={checkToConfirmMessage}
                onChange={(_, checked) => setIsChecked(checked)}
              />
            )}
          </StackItem>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          isDisabled={!isChecked}
          key="confirm"
          onClick={submitHandler}
          variant={severityVariant}
        >
          {t(actionType)}
        </Button>
        <Button key="cancel" onClick={onClose} variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmVMActionModal;
