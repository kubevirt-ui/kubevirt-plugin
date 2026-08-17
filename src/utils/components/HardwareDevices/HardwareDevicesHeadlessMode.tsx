import React, { type FC, useState } from 'react';
import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isHeadlessMode } from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Flex, FlexItem, Switch } from '@patternfly/react-core';

import DescriptionItem from '../DescriptionItem/DescriptionItem';

type HardwareDevicesHeadlessModeProps = {
  onSubmit: (vm: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};
const HardwareDevicesHeadlessMode: FC<HardwareDevicesHeadlessModeProps> = ({ onSubmit, vm }) => {
  const { t } = useKubevirtTranslation();

  const [isChecked, setIsChecked] = useState<boolean>(() => isHeadlessMode(vm));

  const updateHeadlessMode = (checked: boolean): Promise<V1VirtualMachine | void> => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.spec.domain.devices']);
      if (checked) {
        vmDraft.spec.template.spec.domain.devices.autoattachGraphicsDevice = false;
        return vmDraft;
      }
      delete vmDraft.spec.template.spec.domain.devices.autoattachGraphicsDevice;
      return vmDraft;
    });
    return onSubmit(updatedVM);
  };

  return (
    <>
      <DescriptionItem
        bodyContent={t(
          'Whether to attach the default graphics device or not. VNC will not be available if checked',
        )}
        breadcrumb="VirtualMachine.spec.template.devices.autoattachGraphicsDevice"
        descriptionData={
          <Flex spaceItems={{ default: 'spaceItemsNone' }}>
            <FlexItem>
              <Switch
                id="headless-mode"
                isChecked={isChecked}
                onChange={(_event, checked) => {
                  setIsChecked(checked);
                  void updateHeadlessMode(checked);
                }}
              />
            </FlexItem>
          </Flex>
        }
        descriptionHeader={t('Headless mode')}
        isPopover
        olsObj={vm}
        promptType={OLSPromptType.HEADLESS_MODE}
      />
    </>
  );
};
export default HardwareDevicesHeadlessMode;
