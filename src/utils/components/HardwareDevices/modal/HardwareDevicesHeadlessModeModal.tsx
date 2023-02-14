import React, { useMemo, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ModalPendingChangesAlert } from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { getChangedHeadlessMode } from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Checkbox, Form, FormGroup } from '@patternfly/react-core';

type HardwareDevicesHeadlessModeModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vmi?: V1VirtualMachineInstance;
};

const HardwareDevicesHeadlessModeModal: React.FC<HardwareDevicesHeadlessModeModalProps> = ({
  vm,
  isOpen,
  onClose,
  onSubmit,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const [checked, setChecked] = useState<boolean>(
    !vm?.spec?.template?.spec?.domain?.devices?.autoattachGraphicsDevice,
  );

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      if (vm) {
        ensurePath(vmDraft, ['spec.template.spec.domain.devices']);
        vmDraft.spec.template.spec.domain.devices.autoattachGraphicsDevice = !checked ?? null;
      }
    });
    return updatedVM;
  }, [vm, checked]);
  return (
    <TabModal
      obj={updatedVirtualMachine}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={'Headless mode'}
    >
      <Form>
        {vmi && (
          <ModalPendingChangesAlert
            isChanged={getChangedHeadlessMode(updatedVirtualMachine, vmi)}
          />
        )}
        <FormGroup
          fieldId="headless-mode-modal"
          helperText={t(
            'Applying the headless mode to this Virtual Machine will cause the VNC not be available if checked.',
          )}
          isInline
        >
          <Checkbox
            id="headless-mode-checkbox"
            isChecked={checked}
            onChange={setChecked}
            label={t('Enable headless mode')}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default HardwareDevicesHeadlessModeModal;
