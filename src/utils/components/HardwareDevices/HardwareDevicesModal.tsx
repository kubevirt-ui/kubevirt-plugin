import * as React from 'react';

import { produceVMDevices } from '@catalog/utils/WizardVMContext';
import {
  V1GPU,
  V1HostDevice,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, Button, Form, FormGroup, Grid } from '@patternfly/react-core';
import { CheckCircleIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';

import { ModalPendingChangesAlert } from '../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { getChangedGPUDevices, getChangedHostDevices } from '../PendingChanges/utils/helpers';

import DeviceNameSelect from './form/DeviceNameSelect';
import NameFormField from './form/NameFormField';
import PlainIconButton from './form/PlainIconButton';
import useHCPermittedHostDevices from './hooks/useHCPermittedHostDevices';
import HardwareDevicesList from './list/HardwareDevicesList';
import { HARDWARE_DEVICE_TYPE } from './utils/constants';

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
  const { t } = useKubevirtTranslation();
  const [devices, setDevices] = React.useState<V1GPU[] | V1HostDevice[]>(initialDevices);
  const [name, setName] = React.useState<string>();
  const [deviceName, setDeviceName] = React.useState<string>();
  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [addButtonDisabled, setAddButtonDisabled] = React.useState<boolean>(false);

  const permittedHostDevices = useHCPermittedHostDevices();

  const getChangedDevices =
    type === HARDWARE_DEVICE_TYPE.GPUS ? getChangedGPUDevices : getChangedHostDevices;

  const onAddDevice = () => {
    setShowForm(true);
    setAddButtonDisabled(true);
  };

  const onRemoveDevice = (device: V1GPU | V1HostDevice) => {
    setDevices((prevDevices) => prevDevices?.filter((d) => d !== device));
  };

  const onCancel = () => {
    setShowForm(false);
    setAddButtonDisabled(false);
    setName(null);
    setDeviceName(null);
  };

  const onConfirm = () => {
    setDevices((prevDevices) => [...(prevDevices || []), { name, deviceName }]);
    setShowForm(false);
    setAddButtonDisabled(false);
    setName(null);
    setDeviceName(null);
  };

  const updatedVirtualMachine: V1VirtualMachine = React.useMemo(() => {
    const updatedVM = produceVMDevices(vm, (vmDraft: V1VirtualMachine) => {
      if (type === HARDWARE_DEVICE_TYPE.GPUS) {
        vmDraft.spec.template.spec.domain.devices.gpus = [...(devices || [])];
      } else {
        vmDraft.spec.template.spec.domain.devices.hostDevices = [...(devices || [])];
      }
    });
    return updatedVM;
  }, [devices, type, vm]);

  return (
    <TabModal
      obj={updatedVirtualMachine}
      onSubmit={onSubmit}
      isOpen={isOpen}
      onClose={onClose}
      headerText={showForm ? btnText : headerText}
    >
      <Form>
        {vmi && (
          <ModalPendingChangesAlert
            isChanged={getChangedDevices(updatedVirtualMachine, vmi)?.length > 0}
          />
        )}
        {vm?.status?.created && vm?.spec?.running && (
          <Alert
            variant={AlertVariant.info}
            isInline
            title={t('Restart required to apply changes')}
          >
            {t(
              'If you make changes to the following settings you will need to restart the virtual machine in order for them to be applied',
            )}
          </Alert>
        )}
        <HardwareDevicesList devices={devices} handleRemoveDevice={onRemoveDevice} />
        {showForm && (
          <Grid hasGutter>
            <NameFormField name={name} setName={setName} />
            <DeviceNameSelect
              deviceName={deviceName}
              setDeviceName={setDeviceName}
              permittedHostDevices={permittedHostDevices}
            />
            <PlainIconButton
              onClick={onConfirm}
              icon={<CheckCircleIcon />}
              fieldId="confirm-add-device"
            />
            <PlainIconButton onClick={onCancel} icon={<TrashIcon />} fieldId="cancel-add-device" />
          </Grid>
        )}
        <FormGroup fieldId="add-button">
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            onClick={onAddDevice}
            isDisabled={addButtonDisabled}
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
