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
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const HostnameModal: React.FC<HostnameModalProps> = ({ isOpen, onClose, onSubmit, vm, vmi }) => {
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
      headerText={t('Edit hostname')}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        {vmi && (
          <ModalPendingChangesAlert isChanged={getChangedHostname(updatedVirtualMachine, vmi)} />
        )}
        <FormGroup
          fieldId="hostname"
          helperText={t('Please provide hostname.')}
          label={t('Hostname')}
        >
          <TextInput id="hostname" onChange={setHostname} type="text" value={newHostname} />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default HostnameModal;
