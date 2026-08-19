import React, { type FC, useState } from 'react';
import produce from 'immer';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import {
  getCloudInitPropagationMethod,
  getPropagationMethod,
} from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import CloudInitInfoHelper from '../CloudinitDescription/CloudinitInfoHelper';
import TabModal from '../TabModal/TabModal';
import CloudinitForm from './CloudinitForm';
import { useCloudInit } from './utils/useCloudInit';

import './cloud-init.scss';

const CloudinitModal: FC<{
  hideYAMLEditor?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
}> = ({ hideYAMLEditor = false, isOpen, onClose, onSubmit, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { updatedVM, updateFromYAML, ...cloudInitHookValues } = useCloudInit(vm);

  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(false);

  const onEditorSave = (yaml: string): void => {
    setIsSubmitDisabled(false);
    updateFromYAML(yaml);
  };

  const onSubmitModal = (): Promise<V1VirtualMachine | void> => {
    const updateSSHDynamicInjectionVM = produce<V1VirtualMachine>(
      updatedVM,
      (vmDraft: V1VirtualMachine) => {
        if (getPropagationMethod(vmDraft)?.qemuGuestAgent?.users) {
          vmDraft.spec.template.spec.accessCredentials[0].sshPublicKey.propagationMethod =
            getCloudInitPropagationMethod(true, vmDraft);
        }
      },
    );
    return onSubmit(updateSSHDynamicInjectionVM);
  };

  return (
    <TabModal
      headerText={t('Cloud-init')}
      isDisabled={isSubmitDisabled}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmitModal}
      submitBtnText={t('Apply')}
    >
      <Stack hasGutter>
        <StackItem>{vmi && <ModalPendingChangesAlert />}</StackItem>
        <CloudInitInfoHelper />
        {!hideYAMLEditor && (
          <StackItem className="kv-cloudinit--radio">
            <Split hasGutter>
              <SplitItem>
                <strong>{t('Configure via:')}</strong>
              </SplitItem>
              <SplitItem>
                <Radio
                  aria-label={t('Form view')}
                  id="form-radio"
                  isChecked={!showEditor}
                  label={t('Form view')}
                  name={'form-radio'}
                  onChange={() => {
                    setShowEditor(false);
                    setIsSubmitDisabled(false);
                  }}
                />
              </SplitItem>
              <SplitItem>
                <Radio
                  aria-label={t('Script')}
                  id="editor-radio"
                  isChecked={showEditor}
                  label={t('Script')}
                  name={'editor-radio'}
                  onChange={() => {
                    setShowEditor(true);
                    setIsSubmitDisabled(true);
                  }}
                />
              </SplitItem>
            </Split>
          </StackItem>
        )}
        <CloudinitForm
          onEditorSave={onEditorSave}
          setSubmitDisabled={setIsSubmitDisabled}
          showEditor={showEditor}
          {...cloudInitHookValues}
        />
      </Stack>
    </TabModal>
  );
};

export default CloudinitModal;
