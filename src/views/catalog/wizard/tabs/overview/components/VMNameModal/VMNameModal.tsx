import React, { useMemo, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Form, FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

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

  return (
    <TabModal
      headerText={t('Edit hostname')}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        <FormGroup
          fieldId="vm-name"
          helperText={t('Please provide name to VirtualMachine.')}
          helperTextInvalid={isEmpty(vmName) && t('VirtualMachine name can not be empty.')}
          isRequired
          label={t('VirtualMachine name')}
          validated={!isEmpty(vmName) ? ValidatedOptions.default : ValidatedOptions.error}
        >
          <TextInput id="hostname" onChange={setVMName} type="text" value={vmName} />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default VMNameModal;
