import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import { VMDeletionProtectionOptions } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/types';
import { setDeletionProtectionForVM } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';

type DeletionProtectionModalProps = {
  deletionProtectionOption: VMDeletionProtectionOptions;
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const DeletionProtectionModal: FC<DeletionProtectionModalProps> = ({
  deletionProtectionOption,
  isOpen,
  onClose,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const enableDeletionProtection = deletionProtectionOption === VMDeletionProtectionOptions.ENABLE;
  const vmName = getName(vm);
  const vmNamespace = getNamespace(vm);

  const submitHandler = () => {
    setDeletionProtectionForVM(vm, enableDeletionProtection);
    onClose();
  };

  return (
    <Modal
      actions={[
        <Button key="confirm" onClick={submitHandler} variant={ButtonVariant.primary}>
          {enableDeletionProtection ? t('Enable') : t('Disable')}
        </Button>,
        <Button key="cancel" onClick={onClose} variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>,
      ]}
      title={
        enableDeletionProtection
          ? t('Enable deletion protection?')
          : t('Disable deletion protection?')
      }
      className="deletion-protection-modal"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitHandler}
      titleIconVariant="warning"
      variant={ModalVariant.medium}
    >
      {enableDeletionProtection ? (
        <>
          {t(
            'The VirtualMachine cannot be deleted if Deletion Protection is enabled to safeguard from accidental deletion. You can disable Deletion Protection at any time.',
          )}
          <br />
          <br />
          <b>
            {t(
              'Are you sure you want to enable deletion protection for {{vmName}} in {{vmNamespace}}?',
              { vmName, vmNamespace },
            )}
          </b>
        </>
      ) : (
        <>
          {t(
            'Disabling Deletion Protection will allow you to delete this VirtualMachine. VirtualMachine deletion can result in data loss or service disruption.',
          )}
          <br />
          <br />
          <b>
            {t(
              'Are you sure you want to disable deletion protection for {{vmName}} in {{vmNamespace}}?',
              { vmName, vmNamespace },
            )}
          </b>
        </>
      )}
    </Modal>
  );
};

export default DeletionProtectionModal;
