import { waitForDataVolumeReady, waitForVmDiskAndGetName } from '@/utils/vm-actions-direct-k8s';
import {
  waitForVirtualMachinePaused,
  waitForVirtualMachineReady,
  waitForVirtualMachineStopped,
} from '@/utils/vm-k8s-waits';
import {
  waitForApiResponse,
  waitForCondition,
  waitForPageHealthy,
  waitForPageHealthyWithRetry,
} from '@/utils/wait-helpers';

export const waitHelpers = {
  forVmReady: waitForVirtualMachineReady,
  forVmStopped: waitForVirtualMachineStopped,
  forVmPaused: waitForVirtualMachinePaused,
  forCondition: waitForCondition,
  forApiResponse: waitForApiResponse,
  forPageHealthy: waitForPageHealthy,
  forPageHealthyWithRetry: waitForPageHealthyWithRetry,
  forDataVolumeReady: waitForDataVolumeReady,
  forVmDiskAndGetName: waitForVmDiskAndGetName,
};

export type WaitHelpersFixture = typeof waitHelpers;
