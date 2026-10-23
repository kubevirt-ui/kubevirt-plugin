/**
 * Gallery alias for `@kubevirt-utils/resources/vm/hooks/useVMI`.
 * Returns `sceneRunningVmi` when name/namespace match the VM detail scene fixture.
 */
import type { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { sceneRunningVmi } from '../stories/story-vm-detail-fixtures';

/** Resolves a single VMI from gallery fixtures (no API watch). */
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
