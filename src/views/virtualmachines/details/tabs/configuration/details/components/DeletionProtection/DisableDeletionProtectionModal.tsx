import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { setDeletionProtectionforVM } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';

type DisableDeletionProtectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const DisableDeletionProtectionModal: FC<DisableDeletionProtectionModalProps> = ({
  isOpen,
  onClose,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const submitHandler = () => {
    setDeletionProtectionforVM(vm, false);
    onClose();
  };

  return (
    <Modal
      actions={[
        <Button key="confirm" onClick={() => submitHandler()} variant={ButtonVariant.primary}>
          {t('Disable')}
        </Button>,
        <Button key="cancel" onClick={onClose} variant="link">
          {t('Cancel')}
        </Button>,
      ]}
      className="disable-deletion-protection-modal"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => submitHandler()}
      title={t('Disable deletion protection?')}
      variant={ModalVariant.medium}
    >
      {t(
        'Disabling Deletion Protection will allow you to delete this VirtualMachine. VirtualMachine deletion can result in data loss or service disruption.',
      )}
      <br />
      <br />
      <b>
        {t(
          `Are you sure you want to disable deletion protection for ${getName(
            vm,
          )} in ${getNamespace(vm)}?`,
        )}
      </b>
    </Modal>
  );
};

export default DisableDeletionProtectionModal;
