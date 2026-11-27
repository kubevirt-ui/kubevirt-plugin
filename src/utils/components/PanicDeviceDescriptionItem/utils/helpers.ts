import type { TFunction } from 'i18next';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import { getOSLabel } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';

import { DEFAULT_PANIC_DEVICE_MODEL, WINDOWS_PANIC_DEVICE_MODEL } from './constants';

export const getDefaultPanicDeviceModel = (
  vm: V1VirtualMachine,
  preferredPanicDeviceModel?: string,
): string => {
  if (preferredPanicDeviceModel) {
    return preferredPanicDeviceModel;
  }

  if (getOSLabel(vm) === OS_NAME_LABELS.windows) {
    return WINDOWS_PANIC_DEVICE_MODEL;
  }

  return DEFAULT_PANIC_DEVICE_MODEL;
};

export const getPanicDetectionHelpText = (t: TFunction): string =>
  t(
    "Detects guest OS crashes and panics for crash reporting and diagnostics. Toggling this on or off takes effect on this VM's next boot.",
  );
