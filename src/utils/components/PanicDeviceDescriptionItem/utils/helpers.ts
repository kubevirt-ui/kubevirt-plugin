import type { TFunction } from 'i18next';

import type { V1PanicDevice, V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import { getOSLabel } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { DEFAULT_PANIC_DEVICE_MODEL, WINDOWS_PANIC_DEVICE_MODEL } from './constants';

/**
 * panicDevices is V1PanicDevice[] — each entry is an object, e.g. `{ model: 'hyperv' }`.
 * Valid YAML:
 *   panicDevices:
 *     - model: hyperv
 */
export const getEffectivePanicDevices = (
  panicDevices: V1PanicDevice[] | undefined,
  preferredPanicDeviceModel?: string,
): V1PanicDevice[] | undefined => {
  const validPanicDevices = Array.isArray(panicDevices) ? panicDevices : undefined;

  if (!isEmpty(validPanicDevices)) {
    return validPanicDevices;
  }

  if (preferredPanicDeviceModel) {
    return [{ model: preferredPanicDeviceModel }];
  }

  return validPanicDevices;
};

const getPanicDeviceModels = (panicDevices?: V1PanicDevice[]): string | undefined => {
  const models = panicDevices?.map((device) => device?.model)?.filter(Boolean);

  if (isEmpty(models)) {
    return undefined;
  }

  return models.join(', ');
};

/**
 * Status text uses configured model names, otherwise Absent (including empty entries like `-`).
 * hasPanicFromMetric only suppresses the Windows warning / preference-unavailable state.
 */
type GetPanicDeviceDisplayStateArgs = {
  configuredPanicDevices?: V1PanicDevice[];
  hasPanicFromMetric: boolean | undefined;
  inferFromPreference: boolean;
  metricLoaded: boolean;
  panicDevices?: V1PanicDevice[];
  preferenceError?: Error;
  preferenceLoading: boolean;
  t: TFunction;
  vm: V1VirtualMachine;
};

export const getPanicDeviceDisplayState = ({
  configuredPanicDevices,
  hasPanicFromMetric,
  inferFromPreference,
  metricLoaded,
  panicDevices,
  preferenceError,
  preferenceLoading,
  t,
  vm,
}: GetPanicDeviceDisplayStateArgs): {
  isPending: boolean;
  showWindowsWarning: boolean;
  statusText: string;
} => {
  const panicDeviceModels = getPanicDeviceModels(panicDevices);
  const hasConfiguredModels = !isEmpty(panicDeviceModels);
  const isPreferencePending =
    preferenceLoading && inferFromPreference && isEmpty(configuredPanicDevices);
  // Wait on metrics only for a missing/empty list — incomplete entries (e.g. `-`) are Absent immediately.
  const isPending = isPreferencePending || (isEmpty(panicDevices) && !metricLoaded);
  // Metric is warning-only — does not change status text when no models are configured.
  const hasPanicDeviceSignal = hasConfiguredModels || hasPanicFromMetric === true;
  const isPreferenceUnavailable =
    Boolean(preferenceError) &&
    inferFromPreference &&
    isEmpty(configuredPanicDevices) &&
    !hasPanicDeviceSignal;

  const showWindowsWarning =
    getOSLabel(vm) === OS_NAME_LABELS.windows &&
    !hasPanicDeviceSignal &&
    !isPending &&
    !isPreferenceUnavailable;

  let statusText = t('Absent');
  if (hasConfiguredModels) {
    statusText = panicDeviceModels;
  } else if (isPreferenceUnavailable) {
    statusText = t('Unavailable');
  }

  return {
    isPending,
    showWindowsWarning,
    statusText,
  };
};

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
