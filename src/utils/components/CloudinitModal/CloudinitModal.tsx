import React, { FC, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import {
  getCloudInitPropagationMethod,
  getPropagationMethod,
} from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import CloudInitInfoHelper from '../CloudinitDescription/CloudinitInfoHelper';
import TabModal from '../TabModal/TabModal';

import { useCloudInit } from './utils/useCloudInit';
import CloudinitForm from './CloudinitForm';

import './cloud-init.scss';

const CloudinitModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
}> = ({ isOpen, onClose, onSubmit, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { updatedVM, updateFromYAML, ...cloudInitHookValues } = useCloudInit(vm);

  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [isSubmitDisabled, setSubmitDisabled] = useState<boolean>(false);

  const onEditorSave = (yaml: string) => {
    setSubmitDisabled(false);
    updateFromYAML(yaml);
  };

  const onSubmitModal = () => {
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
        <StackItem className="kv-cloudinit--radio">
          <Split hasGutter>
            <SplitItem>
              <strong>{t('Configure via:')}</strong>
            </SplitItem>
            <SplitItem>
              <Radio
                onChange={() => {
                  setShowEditor(false);
                  setSubmitDisabled(false);
                }}
                aria-label={'form-radio'}
                id="form-radio"
                isChecked={!showEditor}
                label={t('Form view')}
                name={'form-radio'}
              />
            </SplitItem>
            <SplitItem>
              <Radio
                onChange={() => {
                  setShowEditor(true);
                  setSubmitDisabled(true);
                }}
                aria-label={'editor-radio'}
                id="editor-radio"
                isChecked={showEditor}
                label={t('Script')}
                name={'editor-radio'}
              />
            </SplitItem>
          </Split>
        </StackItem>
        <CloudinitForm
          onEditorSave={onEditorSave}
          setSubmitDisabled={setSubmitDisabled}
          showEditor={showEditor}
          {...cloudInitHookValues}
        />
      </Stack>
    </TabModal>
  );
};

export default CloudinitModal;
