import usePreference from '@kubevirt-utils/resources/preference/hooks/usePreference';
import { getPreferredPanicDeviceModel } from '@kubevirt-utils/resources/preference/selectors';
import { getName } from '@kubevirt-utils/resources/shared';
import { isPanicDetectionEnabled } from '@kubevirt-utils/resources/vm';

import { getDefaultPanicDeviceModel } from '../utils/helpers';
import type { PanicDeviceDescriptionItemProps } from '../utils/types';

const usePanicDeviceDescriptionState = ({
  vm,
}: Pick<PanicDeviceDescriptionItemProps, 'vm'>): {
  isChecked: boolean;
  panicDeviceModel: string;
  preferenceLoading: boolean;
  vmName: string;
} => {
  const [preference, preferenceLoading] = usePreference(vm);
  const preferredPanicDeviceModel = getPreferredPanicDeviceModel(preference);

  return {
    isChecked: isPanicDetectionEnabled(vm),
    panicDeviceModel: getDefaultPanicDeviceModel(vm, preferredPanicDeviceModel),
    preferenceLoading,
    vmName: getName(vm) ?? '',
  };
};

export default usePanicDeviceDescriptionState;
