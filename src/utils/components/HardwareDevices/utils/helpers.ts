import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { generatePrettyName, isEmpty } from '@kubevirt-utils/utils/utils';

import { HARDWARE_DEVICE_TYPE, HardwareDeviceModalRow } from './constants';

export const getInitialDevices = (
  initialDevices: V1GPU[] | V1HostDevice[],
  type: HARDWARE_DEVICE_TYPE,
): HardwareDeviceModalRow[] =>
  (!isEmpty(initialDevices)
    ? initialDevices
    : [{ deviceName: '', name: generatePrettyName(type) }]
  ).map((device, deviceIndex) => ({ ...device, deviceIndex }));
