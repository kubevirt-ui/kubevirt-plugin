import React, { FC, useState } from 'react';

import { produceVMDevices } from '@catalog/utils/WizardVMContext';
import {
  V1GPU,
  V1HostDevice,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { generatePrettyName, isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant, Form, FormGroup, Grid, GridItem } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

import DeviceNameSelect from '../form/DeviceNameSelect';
import NameFormField from '../form/NameFormField';
import useHCPermittedHostDevices from '../hooks/useHCPermittedHostDevices';
import { HARDWARE_DEVICE_TYPE, HardwareDeviceModalRow } from '../utils/constants';
import { getInitialDevices } from '../utils/helpers';

import HardwareDeviceModalDescription from './HardwareDeviceModalDescription';

import '../hardware-devices-table.scss';

type HardwareDevicesModalProps = {
  btnText: string;
  headerText: string;
  initialDevices: V1GPU[] | V1HostDevice[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  type: HARDWARE_DEVICE_TYPE.GPUS | HARDWARE_DEVICE_TYPE.HOST_DEVICES;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const HardwareDevicesModal: FC<HardwareDevicesModalProps> = ({
  btnText,
  headerText,
  initialDevices,
  isOpen,
  onClose,
  onSubmit,
  type,
  vm,
  vmi,
}) => {
  const [devices, setDevices] = useState<HardwareDeviceModalRow[]>(
    getInitialDevices(initialDevices, type),
  );
  const { permittedHostDevices } = useHCPermittedHostDevices();

  const onAddDevice = () => {
    setDevices((listDevices) => [
      ...listDevices,
      { deviceIndex: devices.length, deviceName: '', name: generatePrettyName(type) },
    ]);
  };

  const onDelete = (index: number) => {
    setDevices((listDevices) =>
      listDevices
        ?.filter((device) => device?.deviceIndex !== index)
        .map((device, deviceIndex) => ({ ...device, deviceIndex })),
    );
  };

  const disableSubmit = devices.some((device) => isEmpty(device?.deviceName));

  const toK8sDevice = ({ deviceName, name }: HardwareDeviceModalRow): V1GPU | V1HostDevice => ({
    deviceName,
    name,
  });

  const updatedVM = produceVMDevices(vm, (vmDraft: V1VirtualMachine) => {
    vmDraft.spec.template.spec.domain.devices[type] = isEmpty(devices)
      ? null
      : devices.map(toK8sDevice);
  });

  return (
    <TabModal
      headerText={headerText}
      isDisabled={disableSubmit}
      isOpen={isOpen}
      obj={updatedVM}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {vmi && <ModalPendingChangesAlert />}
      <Form>
        <HardwareDeviceModalDescription type={type} />
        {devices.map(({ deviceIndex, deviceName, name }) => (
          <Grid hasGutter key={deviceIndex}>
            <GridItem span={5}>
              <NameFormField
                setName={(newName: string) => {
                  setDevices((prevDevices) => {
                    const newDevices = [...prevDevices];
                    newDevices[deviceIndex] = { ...newDevices[deviceIndex], name: newName };
                    return newDevices;
                  });
                }}
                index={deviceIndex}
                name={name}
              />
            </GridItem>
            <GridItem span={5}>
              <DeviceNameSelect
                setDeviceName={(newDeviceName: string) => {
                  setDevices((prevDevices) => {
                    const newDevices = [...prevDevices];
                    newDevices[deviceIndex] = {
                      ...newDevices[deviceIndex],
                      deviceName: newDeviceName,
                    };
                    return newDevices;
                  });
                }}
                deviceName={deviceName}
                index={deviceIndex}
                permittedHostDevices={permittedHostDevices}
              />
            </GridItem>
            <GridItem className="hardware-devices-form-button" span={2}>
              <Button
                icon={<MinusCircleIcon />}
                onClick={() => onDelete(deviceIndex)}
                variant={ButtonVariant.plain}
              />
            </GridItem>
          </Grid>
        ))}
        <FormGroup fieldId="add-button">
          <Button
            className="pf-m-link--align-left"
            icon={<PlusCircleIcon />}
            onClick={onAddDevice}
            variant="link"
          >
            {btnText}
          </Button>
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default HardwareDevicesModal;
