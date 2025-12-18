import React, { FC, useMemo, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getHostname } from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { FormGroup, TextInput } from '@patternfly/react-core';

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
  const [newHostname, setNewHostname] = useState<string>(getHostname(vm));

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
      shouldWrapInForm
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
    </TabModal>
  );
};

export default HostnameModal;
