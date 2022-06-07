import React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import CloudInitInfoHelper from '../CloudinitDescription/CloudinitInfoHelper';
import { ModalPendingChangesAlert } from '../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { getChangedCloudInit } from '../PendingChanges/utils/helpers';
import TabModal from '../TabModal/TabModal';

import { useCloudInit } from './utils/useCloudInit';
import CloudinitForm from './CloudinitForm';

import './cloud-init.scss';

export const CloudinitModal: React.FC<{
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vmi?: V1VirtualMachineInstance;
}> = ({ vm, onSubmit, isOpen, onClose, vmi }) => {
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
      onSubmit={() => onSubmit(updatedVM)}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Cloud-init')}
      submitBtnText={t('Apply')}
      isDisabled={isSubmitDisabled}
    >
      <Stack hasGutter>
        <StackItem>
          {vmi && <ModalPendingChangesAlert isChanged={getChangedCloudInit(updatedVM, vmi)} />}
        </StackItem>
        <CloudInitInfoHelper />
        <StackItem className="kv-cloudinit--radio">
          <Split hasGutter>
            <SplitItem>
              <strong>{t('Configure via:')}</strong>
            </SplitItem>
            <SplitItem>
              <Radio
                label={t('Form view')}
                id="form-radio"
                name={'form-radio'}
                aria-label={'form-radio'}
                isChecked={!showEditor}
                onChange={() => {
                  setShowEditor(false);
                  setSubmitDisabled(false);
                }}
              />
            </SplitItem>
            <SplitItem>
              <Radio
                label={t('Script')}
                id="editor-radio"
                name={'editor-radio'}
                aria-label={'editor-radio'}
                isChecked={showEditor}
                onChange={() => {
                  setShowEditor(true);
                  setSubmitDisabled(true);
                }}
              />
            </SplitItem>
          </Split>
        </StackItem>
        <CloudinitForm
          showEditor={showEditor}
          onEditorSave={onEditorSave}
          {...cloudInitHookValues}
        />
      </Stack>
    </TabModal>
  );
};
