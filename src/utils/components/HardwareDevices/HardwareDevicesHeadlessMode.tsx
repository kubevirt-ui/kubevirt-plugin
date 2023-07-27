import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';
import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  DescriptionListDescription,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Flex,
  FlexItem,
  Popover,
  Switch,
} from '@patternfly/react-core';

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
      <DescriptionListTermHelpText>
        <Popover
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              Whether to attach the default graphics device or not. VNC will not be available if
              checked{' '}
              <Breadcrumb>
                <BreadcrumbItem>VirtualMachine</BreadcrumbItem>
                <BreadcrumbItem>spec</BreadcrumbItem>
                <BreadcrumbItem>template</BreadcrumbItem>
                <BreadcrumbItem>devices</BreadcrumbItem>
                <BreadcrumbItem>autoattachGraphicsDevice</BreadcrumbItem>
              </Breadcrumb>
            </Trans>
          }
          hasAutoWidth
          headerContent={t('Headless mode')}
          maxWidth="30rem"
        >
          <DescriptionListTermHelpTextButton>
            {t('Headless mode')}
          </DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>
      <DescriptionListDescription>
        <Flex spaceItems={{ default: 'spaceItemsNone' }}>
          <FlexItem>
            <Switch
              onChange={(checked) => {
                setIsChecked(checked);
                updateHeadlessMode(checked);
              }}
              id="headless-mode"
              isChecked={isChecked}
            />
          </FlexItem>
        </Flex>
      </DescriptionListDescription>
    </>
  );
};
export default HardwareDevicesHeadlessMode;
