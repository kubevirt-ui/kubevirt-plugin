import { errorPrintableVMStatus, printableVMStatus } from '@virtualmachines/utils';

export const getStatusClass = (vmStatus: string) => {
  let statusClass;

  switch (vmStatus) {
    case printableVMStatus.Provisioning:
      statusClass = 'kubevirt-m-pending';
      break;
    case errorPrintableVMStatus.CrashLoopBackOff:
    case errorPrintableVMStatus.DataVolumeError:
    case errorPrintableVMStatus.ErrImagePull:
    case errorPrintableVMStatus.ErrorDataVolumeNotFound:
    case errorPrintableVMStatus.ErrorPvcNotFound:
    case errorPrintableVMStatus.ErrorUnschedulable:
    case errorPrintableVMStatus.ImagePullBackOff:
    case printableVMStatus.Paused: // TODO Verify this is correct for this status
      statusClass = 'kubevirt-m-error';
      break;
    case printableVMStatus.WaitingForVolumeBinding:
    case printableVMStatus.Starting:
      statusClass = 'kubevirt-m-not-ready';
      break;
    case printableVMStatus.Stopping:
    case printableVMStatus.Terminating:
      statusClass = 'kubevirt-m-terminating';
      break;
    case printableVMStatus.Migrating:
    case printableVMStatus.Running:
      statusClass = 'kubevirt-m-running';
      break;
    case printableVMStatus.Stopped:
      statusClass = 'kubevirt-m-off';
      break;
    case printableVMStatus.Unknown:
    default:
      statusClass = 'kubevirt-m-unknown';
  }

  return statusClass;
};

export const getImageProps = (height: number, width: number, iconRadius: number) => {
  return {
    height: iconRadius * 2,
    width: iconRadius * 2,
    x: width / 2 - iconRadius,
    y: height / 2 - iconRadius,
  };
};
