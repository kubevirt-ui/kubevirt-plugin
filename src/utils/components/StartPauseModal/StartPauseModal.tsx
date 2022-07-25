import React, { useMemo, useState } from 'react';
import produce from 'immer';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Form, FormGroup } from '@patternfly/react-core';

import { ModalPendingChangesAlert } from '../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { getChangedStartStrategy } from '../PendingChanges/utils/helpers';

type StartPauseModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  headerText: string;
  vmi?: V1VirtualMachineInstance;
};

const StartPauseModal: React.FC<StartPauseModalProps> = ({
  vm,
  isOpen,
  onClose,
  onSubmit,
  headerText,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const [checked, setChecked] = useState<boolean>(!!vm?.spec?.template?.spec?.startStrategy);

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.spec']);
      vmDraft.spec.template.spec.startStrategy = checked ? printableVMStatus.Paused : null;
    });
    return updatedVM;
  }, [vm, checked]);
  return (
    <TabModal
      obj={updatedVirtualMachine}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={headerText}
    >
      <Form>
        {vmi && (
          <ModalPendingChangesAlert
            isChanged={getChangedStartStrategy(updatedVirtualMachine, vmi)}
          />
        )}
        <FormGroup
          fieldId="start-pause-mode"
          helperText={t(
            'Applying the start/pause mode to this Virtual Machine will cause it to partially reboot and pause.',
          )}
          isInline
        >
          <Checkbox
            id="start-pause-mode"
            isChecked={checked}
            onChange={setChecked}
            label={t('Start this VirtualMachine in pause mode')}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default StartPauseModal;
