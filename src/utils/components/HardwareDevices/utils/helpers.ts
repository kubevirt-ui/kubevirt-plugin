import { V1GPU, V1HostDevice } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { HardwareDeviceModalRow } from './constants';

export const getInitialDevices = (
  initialDevices: V1GPU[] | V1HostDevice[],
): HardwareDeviceModalRow[] =>
  (!isEmpty(initialDevices) ? initialDevices : [{ name: '', deviceName: '' }]).map(
    (device, deviceIndex) => ({ ...device, deviceIndex }),
  );
