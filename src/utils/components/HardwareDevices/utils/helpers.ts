import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { HARDWARE_DEVICE_TYPE, HardwareDeviceModalRow } from './constants';

export const getInitialDevices = (
  initialDevices: V1GPU[] | V1HostDevice[],
  type: HARDWARE_DEVICE_TYPE,
): HardwareDeviceModalRow[] =>
  (!isEmpty(initialDevices)
    ? initialDevices
    : [{ deviceName: '', name: generateDeviceName(type) }]
  ).map((device, deviceIndex) => ({ ...device, deviceIndex }));

export const generateDeviceName = (type: HARDWARE_DEVICE_TYPE): string => {
  return `${type}-${uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  })}`;
};
