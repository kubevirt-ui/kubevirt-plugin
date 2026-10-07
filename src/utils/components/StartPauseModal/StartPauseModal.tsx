import type { FC } from 'react';
import { useMemo, useState } from 'react';
import produce from 'immer';
import { printableVMStatus } from 'src/views/virtualmachines/utils';

import type {
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import FormGroupHelperText from '../FormGroupHelperText/FormGroupHelperText';

type StartPauseModalProps = {
  headerText: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const StartPauseModal: FC<StartPauseModalProps> = ({
  headerText,
  isOpen,
  onClose,
  onSubmit,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const [initialChecked] = useState<boolean>(() => !!vm?.spec?.template?.spec?.startStrategy);
  const [checked, setChecked] = useState<boolean>(initialChecked);

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.spec']);
      if (checked) {
        vmDraft.spec.template.spec.startStrategy = printableVMStatus.Paused;
      } else {
        delete vmDraft.spec.template.spec.startStrategy;
      }
    });
    return updatedVM;
  }, [vm, checked]);
  return (
    <TabModal
      headerText={headerText}
      isDisabled={checked === initialChecked}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
      submitDisabledTooltip={getNoModalChangesTooltip(t)}
    >
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
            'Applying the start/pause mode to this virtual machine will cause it to partially reboot and pause.',
          )}
        </FormGroupHelperText>
      </FormGroup>
    </TabModal>
  );
};

export default StartPauseModal;
