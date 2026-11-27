import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePreference from '@kubevirt-utils/resources/preference/hooks/usePreference';
import { getPreferredPanicDeviceModel } from '@kubevirt-utils/resources/preference/selectors';
import { getName } from '@kubevirt-utils/resources/shared';
import { getPanicDevices, isPanicDetectionEnabled } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  getDefaultPanicDeviceModel,
  getEffectivePanicDevices,
  getPanicDeviceDisplayState,
} from '../utils/helpers';
import type { PanicDeviceDescriptionItemProps } from '../utils/types';
import useHasPanicDeviceMetric from './useHasPanicDeviceMetric';

const usePanicDeviceDescriptionState = ({
  vm,
  vmi,
}: Pick<PanicDeviceDescriptionItemProps, 'vm' | 'vmi'>): {
  isChecked: boolean;
  isPending: boolean;
  panicDeviceModel: string;
  showWindowsWarning: boolean;
  statusText: string;
  vmName: string;
} => {
  const { t } = useKubevirtTranslation();
  const [preference, preferenceLoading, preferenceError] = usePreference(vm);
  const preferredPanicDeviceModel = getPreferredPanicDeviceModel(preference);
  const configuredPanicDevices = getPanicDevices(vmi ?? vm);
  const inferFromPreference = !vmi;
  const panicDevices = getEffectivePanicDevices(
    configuredPanicDevices,
    inferFromPreference ? preferredPanicDeviceModel : undefined,
  );
  const isPreferencePending =
    preferenceLoading && inferFromPreference && isEmpty(configuredPanicDevices);
  const [hasPanicFromMetric, metricLoaded] = useHasPanicDeviceMetric(
    vm,
    isEmpty(panicDevices) && !isPreferencePending,
  );
  const { isPending, showWindowsWarning, statusText } = getPanicDeviceDisplayState({
    configuredPanicDevices,
    hasPanicFromMetric,
    inferFromPreference,
    metricLoaded,
    panicDevices,
    preferenceError,
    preferenceLoading,
    t,
    vm,
  });

  return {
    isChecked: isPanicDetectionEnabled(vm),
    isPending,
    panicDeviceModel: getDefaultPanicDeviceModel(vm, preferredPanicDeviceModel),
    showWindowsWarning,
    statusText,
    vmName: getName(vm) ?? '',
  };
};

export default usePanicDeviceDescriptionState;
