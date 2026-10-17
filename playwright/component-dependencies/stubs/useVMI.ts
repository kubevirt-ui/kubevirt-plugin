import type { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { sceneRunningVmi } from '../stories/story-vm-detail-fixtures';

const useVMI = (
  name?: string,
  namespace?: string,
  _cluster?: string,
  fetchVMI = true,
): {
  vmi: V1VirtualMachineInstance | undefined;
  vmiLoaded: boolean;
  vmiLoadError: Error | undefined;
} => {
  if (!fetchVMI) {
    return { vmi: undefined, vmiLoaded: true, vmiLoadError: undefined };
  }

  const matchesSceneVm =
    name === sceneRunningVmi.metadata?.name && namespace === sceneRunningVmi.metadata?.namespace;

  return {
    vmi: matchesSceneVm ? sceneRunningVmi : undefined,
    vmiLoaded: true,
    vmiLoadError: undefined,
  };
};

export default useVMI;
