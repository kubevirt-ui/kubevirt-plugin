import { errorPrintableVMStatus, printableVMStatus } from '@virtualmachines/utils';

export const getStatusClass = (vmStatus: string) => {
  switch (vmStatus) {
    case printableVMStatus.Provisioning:
      return 'kubevirt-m-pending';
    case errorPrintableVMStatus.CrashLoopBackOff:
    case errorPrintableVMStatus.DataVolumeError:
    case errorPrintableVMStatus.ErrImagePull:
    case errorPrintableVMStatus.ErrorDataVolumeNotFound:
    case errorPrintableVMStatus.ErrorPvcNotFound:
    case errorPrintableVMStatus.ErrorUnschedulable:
    case errorPrintableVMStatus.ImagePullBackOff:
      return 'kubevirt-m-error';
    case printableVMStatus.Paused: // TODO Verify this is correct for this status
    case printableVMStatus.WaitingForVolumeBinding:
    case printableVMStatus.Starting:
      return 'kubevirt-m-not-ready';
    case printableVMStatus.Stopping:
    case printableVMStatus.Terminating:
      return 'kubevirt-m-terminating';
    case printableVMStatus.Migrating:
    case printableVMStatus.Running:
      return 'kubevirt-m-running';
    case printableVMStatus.Stopped:
      return 'kubevirt-m-off';
    case printableVMStatus.Unknown:
    default:
      return 'kubevirt-m-unknown';
  }
};

export const getImageProps = (height: number, width: number, iconRadius: number) => {
  return {
    height: iconRadius * 2,
    width: iconRadius * 2,
    x: width / 2 - iconRadius,
    y: height / 2 - iconRadius,
  };
};
