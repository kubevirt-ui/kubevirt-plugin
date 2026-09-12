import { useNavigate } from 'react-router';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { EVICTION_STRATEGY_DEFAULT } from '@kubevirt-utils/components/EvictionStrategy/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import useHideYamlTab from '@kubevirt-utils/hooks/useHideYamlTab';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { isRunning } from '@virtualmachines/utils';

import {
  checkBootModeChanged,
  checkBootOrderChanged,
  checkCPUMemoryChanged,
  checkInstanceTypeChanged,
  getChangedAffinity,
  getChangedAuthorizedSSHKey,
  getChangedCDROMs,
  getChangedCloudInit,
  getChangedDedicatedResources,
  getChangedEnvDisks,
  getChangedEvictionStrategy,
  getChangedGPUDevices,
  getChangedGuestSystemAccessLog,
  getChangedHeadlessMode,
  getChangedHostDevices,
  getChangedHostname,
  getChangedNICs,
  getChangedNodeSelector,
  getChangedStartStrategy,
  getChangedTolerations,
  getChangedVolumesHotplug,
} from '../utils/helpers';
import { type PendingChange } from '../utils/types';
import { buildPendingChanges } from './buildPendingChanges';

export const usePendingChanges = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  instanceTypeExpandedSpec: V1VirtualMachine,
): PendingChange[] => {
  const { t } = useKubevirtTranslation();
  const cluster = getCluster(vm);

  const navigate = useNavigate();
  const { createModal } = useModal();
  const [authorizedSSHKeys, updateAuthorizedSSHKeys] = useKubevirtUserSettings(
    USER_SETTINGS_KEYS.ssh,
  );
  const { hideYamlTab } = useHideYamlTab();

  const [hyperConverge, hyperLoaded, hyperLoadingError] = useHyperConvergeConfiguration(cluster);

  const [nodes, nodesLoaded] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  if (!vmi || !isRunning(vm)) {
    return [];
  }

  return buildPendingChanges({
    affinityChanged: getChangedAffinity(vm, vmi),
    authorizedSSHKeys,
    bootModeChanged: checkBootModeChanged(vm, vmi),
    bootOrderChanged: checkBootOrderChanged(vm, vmi),
    cloudInitChanged: getChangedCloudInit(vm, vmi),
    cluster,
    cpuMemoryChanged: checkCPUMemoryChanged(vm, vmi),
    createModal,
    dedicatedResourcesChanged: getChangedDedicatedResources(
      vm,
      vmi,
      getCPU(vm)?.dedicatedCpuPlacement ?? false,
    ),
    evictionStrategyChanged:
      hyperLoaded &&
      !hyperLoadingError &&
      getChangedEvictionStrategy(
        vm,
        vmi,
        hyperConverge?.spec?.evictionStrategy ?? EVICTION_STRATEGY_DEFAULT,
      ),
    hideYamlTab,
    hostnameChanged: getChangedHostname(vm, vmi),
    instanceTypeChanged: checkInstanceTypeChanged(vm, vmi),
    instanceTypeExpandedSpec,
    modifiedCDROMs: getChangedCDROMs(vm, vmi),
    modifiedEnvDisks: getChangedEnvDisks(vm, vmi),
    modifiedGPUDevices: getChangedGPUDevices(vm, vmi),
    modifiedGuestSystemAccessLog: getChangedGuestSystemAccessLog(vm, vmi),
    modifiedHeadlessMode: getChangedHeadlessMode(vm, vmi),
    modifiedHostDevices: getChangedHostDevices(vm, vmi),
    modifiedNICs: getChangedNICs(vm, vmi),
    modifiedVolumesHotplug: getChangedVolumesHotplug(vm, vmi),
    navigate,
    nodes,
    nodeSelectorChanged: getChangedNodeSelector(vm, vmi),
    nodesLoaded,
    sshServiceChanged: getChangedAuthorizedSSHKey(vm, vmi),
    startStrategyChanged: getChangedStartStrategy(vm, vmi),
    t,
    tolerationsChanged: getChangedTolerations(vm, vmi),
    updateAuthorizedSSHKeys,
    vm,
    vmi,
  });
};
