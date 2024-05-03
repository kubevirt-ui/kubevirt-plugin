import React from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import AffinityModal from '@kubevirt-utils/components/AffinityModal/AffinityModal';
import BootOrderModal from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import CloudinitModal from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CPUMemoryModal';
import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import DeschedulerModal from '@kubevirt-utils/components/DeschedulerModal/DeschedulerModal';
import { EVICTION_STRATEGY_DEFAULT } from '@kubevirt-utils/components/EvictionStrategy/constants';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategy/EvictionStrategyModal';
import FirmwareBootloaderModal from '@kubevirt-utils/components/FirmwareBootloaderModal/FirmwareBootloaderModal';
import HardwareDevicesHeadlessModeModal from '@kubevirt-utils/components/HardwareDevices/modal/HardwareDevicesHeadlessModeModal';
import HardwareDevicesModal from '@kubevirt-utils/components/HardwareDevices/modal/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NodeSelectorModal from '@kubevirt-utils/components/NodeSelectorModal/NodeSelectorModal';
import StartPauseModal from '@kubevirt-utils/components/StartPauseModal/StartPauseModal';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
import VMSSHSecretModal from '@kubevirt-utils/components/VMSSHSecretModal/VMSSHSecretModal';
import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { getCPU, getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { isInstanceTypeVM } from '@kubevirt-utils/resources/vm/utils/instanceTypes';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sUpdate, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import {
  checkBootModeChanged,
  checkBootOrderChanged,
  checkCPUMemoryChanged,
  getChangedAffinity,
  getChangedAuthorizedSSHKey,
  getChangedCloudInit,
  getChangedDedicatedResources,
  getChangedDescheduler,
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
  getSortedNICs,
  getTabURL,
  restartRequired,
} from '../utils/helpers';
import { PendingChange } from '../utils/types';

export const usePendingChanges = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): PendingChange[] => {
  const { t } = useKubevirtTranslation();

  const navigate = useNavigate();
  const { createModal } = useModal();
  const [authorizedSSHKeys, updateAuthorizedSSHKeys] = useKubevirtUserSettings('ssh');

  const [hyperConverge, hyperLoaded, hyperLoadingError] = useHyperConvergeConfiguration();

  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const cpuMemoryChanged = checkCPUMemoryChanged(vm, vmi);
  const bootOrderChanged = checkBootOrderChanged(vm, vmi);
  const bootModeChanged = checkBootModeChanged(vm, vmi);
  const dedicatedResourcesChanged = getChangedDedicatedResources(
    vm,
    vmi,
    getCPU(vm)?.dedicatedCpuPlacement || false,
  );
  const startStrategyChanged = getChangedStartStrategy(vm, vmi);
  const hostnameChanged = getChangedHostname(vm, vmi);
  const evictionStrategyChanged =
    hyperLoaded &&
    !hyperLoadingError &&
    getChangedEvictionStrategy(
      vm,
      vmi,
      hyperConverge?.spec?.evictionStrategy || EVICTION_STRATEGY_DEFAULT,
    );

  const nodeSelectorChanged = getChangedNodeSelector(vm, vmi);
  const tolerationsChanged = getChangedTolerations(vm, vmi);
  const affinityChanged = getChangedAffinity(vm, vmi);
  const deschedulerChanged = getChangedDescheduler(
    vm,
    vmi,
    !!vm?.spec?.template?.metadata?.annotations?.[DESCHEDULER_EVICT_LABEL] || false,
  );
  const cloudInitChanged = getChangedCloudInit(vm, vmi);
  const sshServiceChanged = getChangedAuthorizedSSHKey(vm, vmi);

  const modifiedEnvDisks = getChangedEnvDisks(vm, vmi);
  const modifiedNICs = getChangedNICs(vm, vmi);

  const { hotPlugNICs, nonHotPlugNICs } = getSortedNICs(modifiedNICs, vm, vmi);

  const modifiedGPUDevices = getChangedGPUDevices(vm, vmi);
  const modifiedHostDevices = getChangedHostDevices(vm, vmi);

  const modifiedVolumesHotplug = getChangedVolumesHotplug(vm, vmi);
  const modifiedHedlessMode = getChangedHeadlessMode(vm, vmi);
  const modifiedGuestSystemAccessLog = getChangedGuestSystemAccessLog(vm, vmi);

  const onSubmit = (updatedVM: V1VirtualMachine) =>
    k8sUpdate({
      data: updatedVM,
      model: VirtualMachineModel,
      name: updatedVM?.metadata?.name,
      ns: updatedVM?.metadata?.namespace,
    });

  return [
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <CPUMemoryModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} vm={vm} />
        ));
      },
      hasPendingChange: !isInstanceTypeVM(vm) && cpuMemoryChanged && restartRequired(vm),
      label: t('CPU | Memory'),
      tabLabel: VirtualMachineDetailsTabLabel.Details,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <BootOrderModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} vm={vm} vmi={vmi} />
        ));
      },
      hasPendingChange: bootOrderChanged,
      label: t('Boot disk'),
      tabLabel: VirtualMachineDetailsTabLabel.Details,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <HostnameModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} vm={vm} vmi={vmi} />
        ));
      },
      hasPendingChange: hostnameChanged,
      label: t('Hostname'),
      tabLabel: VirtualMachineDetailsTabLabel.Details,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <FirmwareBootloaderModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            vm={vm}
            vmi={vmi}
          />
        ));
      },
      hasPendingChange: bootModeChanged,
      label: t('Boot mode'),
      tabLabel: VirtualMachineDetailsTabLabel.Details,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Environment));
      },
      hasPendingChange: !isEmpty(modifiedEnvDisks),
      label:
        !isEmpty(modifiedEnvDisks) && modifiedEnvDisks?.length > 1
          ? modifiedEnvDisks.join(', ')
          : modifiedEnvDisks[0],
      tabLabel: VirtualMachineDetailsTabLabel.Environment,
    },
    {
      appliedOnLiveMigration: true,
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Network));
      },
      hasPendingChange: !isEmpty(hotPlugNICs),
      label: hotPlugNICs?.length > 1 ? hotPlugNICs.join(', ') : hotPlugNICs[0],
      tabLabel: VirtualMachineDetailsTabLabel.Network,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Network));
      },
      hasPendingChange: !isEmpty(nonHotPlugNICs),
      label: nonHotPlugNICs?.length > 1 ? nonHotPlugNICs.join(', ') : nonHotPlugNICs[0],
      tabLabel: VirtualMachineDetailsTabLabel.Network,
    },

    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <HardwareDevicesModal
            btnText={t('Add GPU device')}
            headerText={t('GPU devices')}
            initialDevices={getGPUDevices(vm)}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            type={HARDWARE_DEVICE_TYPE.GPUS}
            vm={vm}
            vmi={vmi}
          />
        ));
      },
      hasPendingChange: !isEmpty(modifiedGPUDevices),
      label:
        !isEmpty(modifiedGPUDevices) && modifiedGPUDevices?.length > 1
          ? modifiedGPUDevices.join(', ')
          : modifiedGPUDevices[0],
      tabLabel: VirtualMachineDetailsTabLabel.Details,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <HardwareDevicesModal
            btnText={t('Add Host device')}
            headerText={t('Host devices')}
            initialDevices={getHostDevices(vm)}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            type={HARDWARE_DEVICE_TYPE.HOST_DEVICES}
            vm={vm}
            vmi={vmi}
          />
        ));
      },
      hasPendingChange: !isEmpty(modifiedHostDevices),
      label:
        !isEmpty(modifiedHostDevices) && modifiedHostDevices?.length > 1
          ? modifiedHostDevices.join(', ')
          : modifiedHostDevices[0],
      tabLabel: VirtualMachineDetailsTabLabel.Details,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Scheduling));
        createModal(({ isOpen, onClose }) => (
          <DedicatedResourcesModal
            headerText={t('Dedicated resources')}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            vm={vm}
            vmi={vmi}
          />
        ));
      },
      hasPendingChange: dedicatedResourcesChanged,
      label: t('Dedicated resources'),
      tabLabel: VirtualMachineDetailsTabLabel.Scheduling,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Scheduling));
        createModal(({ isOpen, onClose }) => (
          <EvictionStrategyModal
            headerText={t('Eviction strategy')}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            vm={vm}
            vmi={vmi}
          />
        ));
      },
      hasPendingChange: evictionStrategyChanged,
      label: t('Eviction strategy'),
      tabLabel: VirtualMachineDetailsTabLabel.Scheduling,
    },
    {
      handleAction: () => {
        createModal(({ isOpen, onClose }) => (
          <StartPauseModal
            headerText={t('Start in pause mode')}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            vm={vm}
            vmi={vmi}
          />
        ));
      },
      hasPendingChange: startStrategyChanged,
      label: t('Start in pause mode'),
      tabLabel: VirtualMachineDetailsTabLabel.Details,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Scheduling));
        createModal(({ isOpen, onClose }) => (
          <NodeSelectorModal
            isOpen={isOpen}
            nodes={nodes}
            nodesLoaded={nodesLoaded}
            onClose={onClose}
            onSubmit={onSubmit}
            vm={vm}
            vmi={vmi}
          />
        ));
      },
      hasPendingChange: nodeSelectorChanged,
      label: t('Node selector'),
      tabLabel: VirtualMachineDetailsTabLabel.Scheduling,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Scripts));
        createModal(({ isOpen, onClose }) => (
          <CloudinitModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} vm={vm} vmi={vmi} />
        ));
      },
      hasPendingChange: cloudInitChanged,
      label: t('Cloud-init'),
      tabLabel: VirtualMachineDetailsTabLabel.Scripts,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Scheduling));
        createModal(({ isOpen, onClose }) => (
          <TolerationsModal
            isOpen={isOpen}
            nodes={nodes}
            nodesLoaded={nodesLoaded}
            onClose={onClose}
            onSubmit={onSubmit}
            vm={vm}
            vmi={vmi}
          />
        ));
      },
      hasPendingChange: tolerationsChanged,
      label: t('Tolerations'),
      tabLabel: VirtualMachineDetailsTabLabel.Scheduling,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Scheduling));
        createModal(({ isOpen, onClose }) => (
          <AffinityModal
            isOpen={isOpen}
            nodes={nodes}
            nodesLoaded={nodesLoaded}
            onClose={onClose}
            onSubmit={onSubmit}
            vm={vm}
            vmi={vmi}
          />
        ));
      },
      hasPendingChange: affinityChanged,
      label: t('Affinity rules'),
      tabLabel: VirtualMachineDetailsTabLabel.Scheduling,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Scheduling));
        createModal(({ isOpen, onClose }) => (
          <DeschedulerModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            vm={vm}
            vmi={vmi}
          />
        ));
      },
      hasPendingChange: deschedulerChanged,
      label: t('Descheduler'),
      tabLabel: VirtualMachineDetailsTabLabel.Scheduling,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Scripts));
        createModal(({ isOpen, onClose }) => (
          <VMSSHSecretModal
            authorizedSSHKeys={authorizedSSHKeys}
            isOpen={isOpen}
            onClose={onClose}
            updateAuthorizedSSHKeys={updateAuthorizedSSHKeys}
            updateVM={onSubmit}
            vm={vm}
          />
        ));
      },
      hasPendingChange: sshServiceChanged,
      label: t('Public SSH key'),
      tabLabel: VirtualMachineDetailsTabLabel.Scripts,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Storage));
      },
      hasPendingChange: !isEmpty(modifiedVolumesHotplug),
      label: `${t('Make persistent disk')} - (${(modifiedVolumesHotplug || [])
        .map((volume) => volume?.name)
        .join(', ')})`,
      tabLabel: VirtualMachineDetailsTabLabel.Disks,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <HardwareDevicesHeadlessModeModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            vm={vm}
            vmi={vmi}
          />
        ));
      },
      hasPendingChange: modifiedHedlessMode,
      label: t('Headless mode'),
      tabLabel: VirtualMachineDetailsTabLabel.Details,
    },
    {
      handleAction: () => {
        navigate(getTabURL(vm, VirtualMachineDetailsTab.Details));
      },
      hasPendingChange: modifiedGuestSystemAccessLog,
      label: t('Guest system log access'),
      tabLabel: VirtualMachineDetailsTabLabel.Details,
    },
  ];
};
