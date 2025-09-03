import React, { FC, useMemo, useRef, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal, {
  TabModalRefExposedFunctions,
} from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import FormGroupHelperText from '../FormGroupHelperText/FormGroupHelperText';

type HostnameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const HostnameModal: FC<HostnameModalProps> = ({ isOpen, onClose, onSubmit, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const modalRef = useRef<TabModalRefExposedFunctions>();
  const [newHostname, setNewHostname] = useState<string>(vm?.spec?.template?.spec?.hostname);

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.spec']);
      vmDraft.spec.template.spec.hostname = newHostname || undefined;
    });
    return updatedVM;
  }, [vm, newHostname]);
  return (
    <TabModal
      headerText={t('Edit hostname')}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
      ref={modalRef}
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          modalRef.current?.handleSubmit(e);
        }}
      >
        {vmi && <ModalPendingChangesAlert />}
        <FormGroup fieldId="hostname" label={t('Hostname')}>
          <TextInput
            autoFocus
            id="hostname"
            onChange={(_event, val) => setNewHostname(val)}
            type="text"
            value={newHostname}
          />
          <FormGroupHelperText>{t('Please provide hostname.')}</FormGroupHelperText>
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default HostnameModal;
