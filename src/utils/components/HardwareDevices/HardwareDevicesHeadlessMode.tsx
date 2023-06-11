import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonVariant,
  DescriptionListDescription,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Flex,
  FlexItem,
  Popover,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import { useModal } from '../ModalProvider/ModalProvider';

import HardwareDevicesHeadlessModeModal from './modal/HardwareDevicesHeadlessModeModal';

type HardwareDevicesHeadlessModeProps = {
  onSubmit: (vm: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const HardwareDevicesHeadlessMode: FC<HardwareDevicesHeadlessModeProps> = ({
  onSubmit,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const devices = vm?.spec?.template?.spec?.domain?.devices;
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
        <Button
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <HardwareDevicesHeadlessModeModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                vm={vm}
                vmi={vmi}
              />
            ))
          }
          data-test-id={'hardware-devices-headless-mode'}
          isInline
          type="button"
          variant={ButtonVariant.link}
        >
          <Flex spaceItems={{ default: 'spaceItemsNone' }}>
            <FlexItem>
              {t(
                devices?.hasOwnProperty('autoattachGraphicsDevice') &&
                  !devices?.autoattachGraphicsDevice
                  ? 'ON'
                  : 'OFF',
              )}
            </FlexItem>
            <FlexItem>
              <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
            </FlexItem>
          </Flex>
        </Button>
      </DescriptionListDescription>
    </>
  );
};

export default HardwareDevicesHeadlessMode;
