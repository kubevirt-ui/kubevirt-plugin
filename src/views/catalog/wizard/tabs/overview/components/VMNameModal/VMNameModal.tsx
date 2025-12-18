import React, { useMemo, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import {
  isValidVMName,
  validateVMName,
} from '@kubevirt-utils/components/VMNameValidationHelperText/utils/utils';
import VMNameValidationHelperText from '@kubevirt-utils/components/VMNameValidationHelperText/VMNameValidationHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput } from '@patternfly/react-core';

type HostnameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const VMNameModal: React.FC<HostnameModalProps> = ({ isOpen, onClose, onSubmit, vm }) => {
  const { t } = useKubevirtTranslation();
  const [vmName, setVMName] = useState<string>(vm?.metadata?.name);

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      vmDraft.metadata.name = vmName;
    });
    return updatedVM;
  }, [vm, vmName]);

  const vmNameValidated = validateVMName(vmName);

  return (
    <TabModal
      headerText={t('Edit VirtualMachine name')}
      isDisabled={!isValidVMName(vmName)}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
    >
      <FormGroup fieldId="vm-name" isRequired label={t('VirtualMachine name')}>
        <TextInput
          id="vm-name"
          onChange={(_event, val) => setVMName(val)}
          type="text"
          validated={vmNameValidated}
          value={vmName}
        />
        <VMNameValidationHelperText showDefaultHelperText vmName={vmName} />
      </FormGroup>
    </TabModal>
  );
};

export default VMNameModal;
