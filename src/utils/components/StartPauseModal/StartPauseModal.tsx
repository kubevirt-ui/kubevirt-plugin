import React, { useMemo, useState } from 'react';
import produce from 'immer';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Checkbox, Form, FormGroup } from '@patternfly/react-core';

import FormGroupHelperText from '../FormGroupHelperText/FormGroupHelperText';

type StartPauseModalProps = {
  headerText: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const StartPauseModal: React.FC<StartPauseModalProps> = ({
  headerText,
  isOpen,
  onClose,
  onSubmit,
  vm,
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
      headerText={headerText}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        {vmi && <ModalPendingChangesAlert />}
        <FormGroup fieldId="start-pause-mode" isInline>
          <Checkbox
            id="start-pause-mode"
            isChecked={checked}
            label={t('Start this VirtualMachine in pause mode')}
            onChange={(_event, val) => setChecked(val)}
          />
          <FormGroupHelperText>
            {t(
              'Applying the start/pause mode to this Virtual Machine will cause it to partially reboot and pause.',
            )}
          </FormGroupHelperText>
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default StartPauseModal;
