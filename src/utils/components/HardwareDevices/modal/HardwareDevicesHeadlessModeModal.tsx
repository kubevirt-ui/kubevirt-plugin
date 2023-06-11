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
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const HardwareDevicesHeadlessModeModal: React.FC<HardwareDevicesHeadlessModeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vm,
  vmi,
}) => {
  const devices = vm?.spec?.template?.spec?.domain?.devices;
  const { t } = useKubevirtTranslation();
  const [checked, setChecked] = useState<boolean>(
    devices?.hasOwnProperty('autoattachGraphicsDevice') && !devices?.autoattachGraphicsDevice,
  );

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      if (vm) {
        ensurePath(vmDraft, ['spec.template.spec.domain.devices']);
        if (checked) {
          vmDraft.spec.template.spec.domain.devices.autoattachGraphicsDevice = !checked;
          return vmDraft;
        }
        delete vmDraft.spec.template.spec.domain.devices.autoattachGraphicsDevice;
        return vmDraft;
      }
    });
    return updatedVM;
  }, [vm, checked]);
  return (
    <TabModal
      headerText={'Headless mode'}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        {vmi && (
          <ModalPendingChangesAlert
            isChanged={getChangedHeadlessMode(updatedVirtualMachine, vmi)}
          />
        )}
        <FormGroup
          helperText={t(
            'Applying the headless mode to this Virtual Machine will cause the VNC not be available if checked.',
          )}
          fieldId="headless-mode-modal"
          isInline
        >
          <Checkbox
            id="headless-mode-checkbox"
            isChecked={checked}
            label={t('Enable headless mode')}
            onChange={setChecked}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default HardwareDevicesHeadlessModeModal;
