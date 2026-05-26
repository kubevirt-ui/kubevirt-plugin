import { VM_ERROR_STATUSES, VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';

import { TELEMETRY_VM_ERROR_TYPE } from './property-constants';
import { VMErrorTypeTelemetry } from './types';

export const getVMErrorTelemetryType = (printableStatus: string): null | VMErrorTypeTelemetry => {
  if (!VM_ERROR_STATUSES.includes(printableStatus as VM_STATUS)) {
    return null;
  }

  switch (printableStatus) {
    case VM_STATUS.CrashLoopBackOff:
      return TELEMETRY_VM_ERROR_TYPE.CRASHLOOP;
    case VM_STATUS.ErrImagePull:
    case VM_STATUS.ImagePullBackOff:
      return TELEMETRY_VM_ERROR_TYPE.IMAGE_PULL_FAILED;
    case VM_STATUS.ErrorUnschedulable:
      return TELEMETRY_VM_ERROR_TYPE.UNSCHEDULABLE;
    case VM_STATUS.DataVolumeError:
    case VM_STATUS.ErrorDataVolumeNotFound:
    case VM_STATUS.ErrorPvcNotFound:
    case VM_STATUS.WaitingForVolumeBinding:
      return TELEMETRY_VM_ERROR_TYPE.PROVISIONING_STUCK;
    default:
      return TELEMETRY_VM_ERROR_TYPE.OTHER;
  }
};
