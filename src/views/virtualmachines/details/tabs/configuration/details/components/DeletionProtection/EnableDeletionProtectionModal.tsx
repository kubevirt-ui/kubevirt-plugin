import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { setDeletionProtectionforVM } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';

type EnableDeletionProtectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const EnableDeletionProtectionModal: FC<EnableDeletionProtectionModalProps> = ({
  isOpen,
  onClose,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  const submitHandler = () => {
    setDeletionProtectionforVM(vm, true);
    onClose();
  };

  return (
    <Modal
      actions={[
        <Button key="confirm" onClick={() => submitHandler()} variant={ButtonVariant.primary}>
          {t('Enable')}
        </Button>,
        <Button key="cancel" onClick={onClose} variant="link">
          {t('Cancel')}
        </Button>,
      ]}
      className="enable-deletion-protection-modal"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => submitHandler()}
      title={t('Enable deletion protection?')}
      variant={ModalVariant.medium}
    >
      {t(
        'The VirtualMachine cannot be deleted if Deletion Protection is enabled to safeguard from accidental deletion. You can disable Deletion Protection at any time.',
      )}
      <br />
      <br />
      <b>
        {t(
          `Are you sure you want to enable deletion protection for ${getName(vm)} in ${getNamespace(
            vm,
          )}?`,
        )}
      </b>
    </Modal>
  );
};

export default EnableDeletionProtectionModal;
