import React, { useMemo, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import { ModalPendingChangesAlert } from '../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { getChangedHostname } from '../PendingChanges/utils/helpers';

type HostnameModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vmi?: V1VirtualMachineInstance;
};

const HostnameModal: React.FC<HostnameModalProps> = ({ vm, isOpen, onClose, onSubmit, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [newHostname, setHostname] = useState<string>(vm?.spec?.template?.spec?.hostname);

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.spec']);
      vmDraft.spec.template.spec.hostname = newHostname || undefined;
    });
    return updatedVM;
  }, [vm, newHostname]);
  return (
    <TabModal
      obj={updatedVirtualMachine}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={t('Edit hostname')}
    >
      <Form>
        {vmi && (
          <ModalPendingChangesAlert isChanged={getChangedHostname(updatedVirtualMachine, vmi)} />
        )}
        <FormGroup
          label={t('Hostname')}
          fieldId="hostname"
          helperText={t('Please provide hostname.')}
        >
          <TextInput value={newHostname} type="text" id="hostname" onChange={setHostname} />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default HostnameModal;
