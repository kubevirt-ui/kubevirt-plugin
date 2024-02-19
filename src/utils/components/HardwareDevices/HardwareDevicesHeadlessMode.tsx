import React, { FC, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Flex, FlexItem, Switch } from '@patternfly/react-core';

import VirtualMachineDescriptionItem from '../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

type HardwareDevicesHeadlessModeProps = {
  onSubmit: (vm: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};
const HardwareDevicesHeadlessMode: FC<HardwareDevicesHeadlessModeProps> = ({ onSubmit, vm }) => {
  const { t } = useKubevirtTranslation();

  const devices = vm?.spec?.template?.spec?.domain?.devices;
  const [isChecked, setIsChecked] = useState<boolean>(
    devices?.hasOwnProperty('autoattachGraphicsDevice') && !devices?.autoattachGraphicsDevice,
  );

  const updateHeadlessMode = (checked: boolean) => {
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
    return onSubmit(updatedVM);
  };

  return (
    <>
      <VirtualMachineDescriptionItem
        bodyContent={t(
          'Whether to attach the default graphics device or not. VNC will not be available if checked',
        )}
        descriptionData={
          <Flex spaceItems={{ default: 'spaceItemsNone' }}>
            <FlexItem>
              <Switch
                onChange={(_event, checked) => {
                  setIsChecked(checked);
                  updateHeadlessMode(checked);
                }}
                id="headless-mode"
                isChecked={isChecked}
              />
            </FlexItem>
          </Flex>
        }
        breadcrumb="VirtualMachine.spec.template.devices.autoattachGraphicsDevice"
        descriptionHeader={t('Headless mode')}
        isPopover
      />
    </>
  );
};
export default HardwareDevicesHeadlessMode;
