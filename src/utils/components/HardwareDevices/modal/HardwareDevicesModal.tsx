import * as React from 'react';

import { produceVMDevices } from '@catalog/utils/WizardVMContext';
import {
  V1GPU,
  V1HostDevice,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant, Form, FormGroup, Grid, GridItem } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

import { ModalPendingChangesAlert } from '../../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { getChangedGPUDevices, getChangedHostDevices } from '../../PendingChanges/utils/helpers';
import DeviceNameSelect from '../form/DeviceNameSelect';
import NameFormField from '../form/NameFormField';
import useHCPermittedHostDevices from '../hooks/useHCPermittedHostDevices';
import { HARDWARE_DEVICE_TYPE, HardwareDeviceModalRow } from '../utils/constants';
import { getInitialDevices } from '../utils/helpers';

import HardwareDeviceModalDescription from './HardwareDeviceModalDescription';

import '../hardware-devices-table.scss';

type HardwareDevicesModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  initialDevices: V1GPU[] | V1HostDevice[];
  btnText: string;
  type: HARDWARE_DEVICE_TYPE.GPUS | HARDWARE_DEVICE_TYPE.HOST_DEVICES;
  vmi?: V1VirtualMachineInstance;
};

const HardwareDevicesModal: React.FC<HardwareDevicesModalProps> = ({
  vm,
  isOpen,
  onClose,
  headerText,
  onSubmit,
  initialDevices,
  btnText,
  type,
  vmi,
}) => {
  const [devices, setDevices] = React.useState<HardwareDeviceModalRow[]>(
    getInitialDevices(initialDevices),
  );
  const permittedHostDevices = useHCPermittedHostDevices();

  const onAddDevice = () => {
    setDevices((listDevices) => [
      ...listDevices,
      { name: '', deviceName: '', deviceIndex: devices.length },
    ]);
  };

  const onDelete = (index: number) => {
    setDevices((listDevices) =>
      listDevices
        ?.filter((device) => device?.deviceIndex !== index)
        .map((device, deviceIndex) => ({ ...device, deviceIndex })),
    );
  };
  const getChangedDevices =
    type === HARDWARE_DEVICE_TYPE.GPUS ? getChangedGPUDevices : getChangedHostDevices;

  const updatedVM = produceVMDevices(vm, (vmDraft: V1VirtualMachine) => {
    vmDraft.spec.template.spec.domain.devices[type] = !isEmpty(devices) ? devices : null;
  });

  const hasNewDevices = devices?.some(
    (device) => !isEmpty(device.name) || !isEmpty(device.deviceName),
  );
  const disableSubmit =
    !isEmpty(devices) &&
    devices?.some((device) => isEmpty(device.name) || isEmpty(device.deviceName));
  return (
    <TabModal
      obj={updatedVM}
      onSubmit={onSubmit}
      isOpen={isOpen}
      onClose={onClose}
      headerText={headerText}
      isDisabled={disableSubmit}
    >
      {vmi && (
        <ModalPendingChangesAlert
          isChanged={getChangedDevices(updatedVM, vmi)?.length > 0 && hasNewDevices}
        />
      )}
      <Form>
        <HardwareDeviceModalDescription type={type} />
        {devices.map(({ name, deviceName, deviceIndex }) => (
          <Grid hasGutter key={deviceIndex}>
            <GridItem span={5}>
              <NameFormField
                name={name}
                index={deviceIndex}
                setName={(newName: string) => {
                  setDevices((prevDevices) => {
                    const newDevices = [...prevDevices];
                    newDevices[deviceIndex] = { ...newDevices[deviceIndex], name: newName };
                    return newDevices;
                  });
                }}
              />
            </GridItem>
            <GridItem span={5}>
              <DeviceNameSelect
                index={deviceIndex}
                deviceName={deviceName}
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
                permittedHostDevices={permittedHostDevices}
              />
            </GridItem>
            <GridItem span={2} className="hardware-devices-form-button">
              <Button onClick={() => onDelete(deviceIndex)} variant={ButtonVariant.plain}>
                <MinusCircleIcon />
              </Button>
            </GridItem>
          </Grid>
        ))}
        <FormGroup fieldId="add-button">
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            onClick={onAddDevice}
            className="pf-m-link--align-left"
          >
            {btnText}
          </Button>
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default HardwareDevicesModal;
