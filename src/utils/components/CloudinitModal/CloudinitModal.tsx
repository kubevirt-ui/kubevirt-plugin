import React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import CloudInitInfoHelper from '../CloudinitDescription/CloudinitInfoHelper';
import TabModal from '../TabModal/TabModal';

import { useCloudInit } from './utils/useCloudInit';
import CloudinitForm from './CloudinitForm';

import './cloud-init.scss';

export const CloudinitModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
}> = ({ isOpen, onClose, onSubmit, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { updatedVM, updateFromYAML, ...cloudInitHookValues } = useCloudInit(vm);

  const [showEditor, setShowEditor] = React.useState(false);
  const [isSubmitDisabled, setSubmitDisabled] = React.useState(false);

  const onEditorSave = React.useCallback(
    (yaml: string) => {
      setSubmitDisabled(false);
      updateFromYAML(yaml);
    },
    [updateFromYAML],
  );

  return (
    <TabModal
      headerText={t('Cloud-init')}
      isDisabled={isSubmitDisabled}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit(updatedVM)}
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
