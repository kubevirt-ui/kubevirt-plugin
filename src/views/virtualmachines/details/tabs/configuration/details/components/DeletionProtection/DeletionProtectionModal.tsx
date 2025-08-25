import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  Button,
  ButtonVariant,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
import { VMDeletionProtectionOptions } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/types';

type DeletionProtectionModalProps = {
  deletionProtectionOption: VMDeletionProtectionOptions;
  isOpen: boolean;
  onCancel: () => void;
  onClose: (enableDeletionProtection?: boolean) => void;
  vm: V1VirtualMachine;
};

const DeletionProtectionModal: FC<DeletionProtectionModalProps> = ({
  deletionProtectionOption,
  isOpen,
  onCancel,
  onClose,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const enableDeletionProtection = deletionProtectionOption === VMDeletionProtectionOptions.ENABLE;
  const vmName = getName(vm);
  const vmNamespace = getNamespace(vm);

  const submitHandler = () => {
    onClose(enableDeletionProtection);
  };

  return (
    <Modal
      className="deletion-protection-modal"
      isOpen={isOpen}
      onClose={onCancel}
      onSubmit={submitHandler}
      variant={ModalVariant.medium}
    >
      <ModalHeader
        title={
          enableDeletionProtection
            ? t('Enable deletion protection?')
            : t('Disable deletion protection?')
        }
        titleIconVariant="warning"
      />
      <ModalBody>
        <Content>
          {enableDeletionProtection ? (
            <>
              <p>
                {t(
                  'The VirtualMachine cannot be deleted if Deletion Protection is enabled to safeguard from accidental deletion. You can disable Deletion Protection at any time.',
                )}
              </p>
              <b>
                {t(
                  'Are you sure you want to enable deletion protection for {{vmName}} in {{vmNamespace}}?',
                  { vmName, vmNamespace },
                )}
              </b>
            </>
          ) : (
            <>
              <p>
                {t(
                  'Disabling Deletion Protection will allow you to delete this VirtualMachine. VirtualMachine deletion can result in data loss or service disruption.',
                )}
              </p>
              <b>
                {t(
                  'Are you sure you want to disable deletion protection for {{vmName}} in {{vmNamespace}}?',
                  { vmName, vmNamespace },
                )}
              </b>
            </>
          )}
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button key="confirm" onClick={submitHandler}>
          {enableDeletionProtection ? t('Enable') : t('Disable')}
        </Button>
        <Button
          onClick={() => {
            onCancel();
          }}
          key="cancel"
          variant={ButtonVariant.link}
        >
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeletionProtectionModal;
