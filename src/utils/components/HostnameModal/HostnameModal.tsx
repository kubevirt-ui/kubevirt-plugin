import React, { FC, useMemo, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getHostname } from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { getNameValidationMessage } from '@kubevirt-utils/utils/validation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

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
  const [isTouched, setIsTouched] = useState(false);

  const hostnameError = getNameValidationMessage(t, newHostname);
  const isHostnameInvalid = isTouched && !!hostnameError;

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
      isDisabled={!!getNameValidationMessage(t, newHostname)}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
    >
      {vmi && <ModalPendingChangesAlert />}
      <FormGroup fieldId="hostname" isRequired label={t('Hostname')}>
        <TextInput
          autoFocus
          id="hostname"
          onBlur={() => setIsTouched(true)}
          onChange={(_event, val) => setNewHostname(val)}
          type="text"
          validated={isHostnameInvalid ? ValidatedOptions.error : ValidatedOptions.default}
          value={newHostname}
        />
        <FormGroupHelperText validated={isHostnameInvalid ? ValidatedOptions.error : undefined}>
          {isHostnameInvalid ? hostnameError : t('Please provide hostname.')}
        </FormGroupHelperText>
      </FormGroup>
    </TabModal>
  );
};

export default HostnameModal;
