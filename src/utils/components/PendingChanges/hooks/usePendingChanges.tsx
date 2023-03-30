import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import AffinityModal from '@kubevirt-utils/components/AffinityModal/AffinityModal';
import { BootOrderModal } from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import { CloudinitModal } from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import DeschedulerModal from '@kubevirt-utils/components/DeschedulerModal/DeschedulerModal';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategyModal/EvictionStrategyModal';
import FirmwareBootloaderModal from '@kubevirt-utils/components/FirmwareBootloaderModal/FirmwareBootloaderModal';
import HardwareDevicesHeadlessModeModal from '@kubevirt-utils/components/HardwareDevices/modal/HardwareDevicesHeadlessModeModal';
import HardwareDevicesModal from '@kubevirt-utils/components/HardwareDevices/modal/HardwareDevicesModal';
import { HARDWARE_DEVICE_TYPE } from '@kubevirt-utils/components/HardwareDevices/utils/constants';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NodeSelectorModal from '@kubevirt-utils/components/NodeSelectorModal/NodeSelectorModal';
import StartPauseModal from '@kubevirt-utils/components/StartPauseModal/StartPauseModal';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
import { VMAuthorizedSSHKeyModal } from '@kubevirt-utils/components/VMAuthorizedSSHKeyModal/VMAuthorizedSSHKeyModal';
import {
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
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
  getChangedHeadlessMode,
  getChangedHostDevices,
  getChangedHostname,
  getChangedNics,
  getChangedNodeSelector,
  getChangedStartStrategy,
  getChangedTolerations,
  getChangedVolumesHotplug,
  getTabURL,
} from '../utils/helpers';
import { PendingChange } from '../utils/types';

export const usePendingChanges = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): PendingChange[] => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const { createModal } = useModal();
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
    vm?.spec?.template?.spec?.domain?.cpu?.dedicatedCpuPlacement || false,
  );
  const startStrategyChanged = getChangedStartStrategy(vm, vmi);
  const hostnameChanged = getChangedHostname(vm, vmi);
  const evictionStrategyChanged = getChangedEvictionStrategy(
    vm,
    vmi,
    !!vm?.spec?.template?.spec?.evictionStrategy,
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
  const modifiedNics = getChangedNics(vm, vmi);
  const modifiedGPUDevices = getChangedGPUDevices(vm, vmi);
  const modifiedHostDevices = getChangedHostDevices(vm, vmi);

  const modifiedVolumesHotplug = getChangedVolumesHotplug(vm, vmi);
  const modifiedHedlessMode = getChangedHeadlessMode(vm, vmi);

  const onSubmit = (updatedVM: V1VirtualMachine) =>
    k8sUpdate({
      model: VirtualMachineModel,
      data: updatedVM,
      ns: updatedVM?.metadata?.namespace,
      name: updatedVM?.metadata?.name,
    });

  return [
    {
      hasPendingChange: cpuMemoryChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Details,
      label: t('CPU | Memory'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <CPUMemoryModal vm={vm} isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} vmi={vmi} />
        ));
      },
    },
    {
      hasPendingChange: bootOrderChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Details,
      label: t('Boot disk'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <BootOrderModal vm={vm} isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} vmi={vmi} />
        ));
      },
    },
    {
      hasPendingChange: hostnameChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Details,
      label: t('Hostname'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <HostnameModal vm={vm} isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} vmi={vmi} />
        ));
      },
    },
    {
      hasPendingChange: bootModeChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Details,
      label: t('Boot mode'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <FirmwareBootloaderModal
            vm={vm}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            vmi={vmi}
          />
        ));
      },
    },
    {
      hasPendingChange: !isEmpty(modifiedEnvDisks),
      tabLabel: VirtualMachineDetailsTabLabel.Environment,
      label:
        !isEmpty(modifiedEnvDisks) && modifiedEnvDisks?.length > 1
          ? modifiedEnvDisks.join(', ')
          : modifiedEnvDisks[0],
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Environment));
      },
    },
    {
      hasPendingChange: !isEmpty(modifiedNics),
      tabLabel: VirtualMachineDetailsTabLabel.NetworkInterfaces,
      label:
        !isEmpty(modifiedNics) && modifiedNics?.length > 1
          ? modifiedNics.join(', ')
          : modifiedNics[0],
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.NetworkInterfaces));
      },
    },
    {
      hasPendingChange: !isEmpty(modifiedGPUDevices),
      tabLabel: VirtualMachineDetailsTabLabel.Details,
      label:
        !isEmpty(modifiedGPUDevices) && modifiedGPUDevices?.length > 1
          ? modifiedGPUDevices.join(', ')
          : modifiedGPUDevices[0],
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <HardwareDevicesModal
            vm={vm}
            isOpen={isOpen}
            onClose={onClose}
            headerText={t('GPU devices')}
            onSubmit={onSubmit}
            initialDevices={getGPUDevices(vm)}
            btnText={t('Add GPU device')}
            type={HARDWARE_DEVICE_TYPE.GPUS}
            vmi={vmi}
          />
        ));
      },
    },
    {
      hasPendingChange: !isEmpty(modifiedHostDevices),
      tabLabel: VirtualMachineDetailsTabLabel.Details,
      label:
        !isEmpty(modifiedHostDevices) && modifiedHostDevices?.length > 1
          ? modifiedHostDevices.join(', ')
          : modifiedHostDevices[0],
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <HardwareDevicesModal
            vm={vm}
            isOpen={isOpen}
            onClose={onClose}
            headerText={t('Host devices')}
            onSubmit={onSubmit}
            initialDevices={getHostDevices(vm)}
            btnText={t('Add Host device')}
            type={HARDWARE_DEVICE_TYPE.HOST_DEVICES}
            vmi={vmi}
          />
        ));
      },
    },
    {
      hasPendingChange: dedicatedResourcesChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Scheduling,
      label: t('Dedicated resources'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Scheduling));
        createModal(({ isOpen, onClose }) => (
          <DedicatedResourcesModal
            vm={vm}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            headerText={t('Dedicated resources')}
            vmi={vmi}
          />
        ));
      },
    },
    {
      hasPendingChange: evictionStrategyChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Scheduling,
      label: t('Eviction strategy'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Scheduling));
        createModal(({ isOpen, onClose }) => (
          <EvictionStrategyModal
            vm={vm}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            headerText={t('Eviction strategy')}
            vmi={vmi}
          />
        ));
      },
    },
    {
      hasPendingChange: startStrategyChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Details,
      label: t('Start in pause mode'),
      handleAction: () => {
        createModal(({ isOpen, onClose }) => (
          <StartPauseModal
            vm={vm}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            headerText={t('Start in pause mode')}
            vmi={vmi}
          />
        ));
      },
    },
    {
      hasPendingChange: nodeSelectorChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Scheduling,
      label: t('Node selector'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Scheduling));
        createModal(({ isOpen, onClose }) => (
          <NodeSelectorModal
            vm={vm}
            nodes={nodes}
            nodesLoaded={nodesLoaded}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            vmi={vmi}
          />
        ));
      },
    },
    {
      hasPendingChange: cloudInitChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Scripts,
      label: t('Cloud-init'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Scripts));
        createModal(({ isOpen, onClose }) => (
          <CloudinitModal vm={vm} isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} vmi={vmi} />
        ));
      },
    },
    {
      hasPendingChange: tolerationsChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Scheduling,
      label: t('Tolerations'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Scheduling));
        createModal(({ isOpen, onClose }) => (
          <TolerationsModal
            vm={vm}
            nodes={nodes}
            nodesLoaded={nodesLoaded}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            vmi={vmi}
          />
        ));
      },
    },
    {
      hasPendingChange: affinityChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Scheduling,
      label: t('Affinity rules'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Scheduling));
        createModal(({ isOpen, onClose }) => (
          <AffinityModal
            vm={vm}
            nodes={nodes}
            nodesLoaded={nodesLoaded}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            vmi={vmi}
          />
        ));
      },
    },
    {
      hasPendingChange: deschedulerChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Scheduling,
      label: t('Descheduler'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Scheduling));
        createModal(({ isOpen, onClose }) => (
          <DeschedulerModal
            vm={vm}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            vmi={vmi}
          />
        ));
      },
    },
    {
      hasPendingChange: sshServiceChanged,
      tabLabel: VirtualMachineDetailsTabLabel.Scripts,
      label: t('Authorized SSH key'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Scripts));
        createModal(({ isOpen, onClose }) => (
          <VMAuthorizedSSHKeyModal vm={vm} isOpen={isOpen} onClose={onClose} vmi={vmi} />
        ));
      },
    },
    {
      hasPendingChange: !isEmpty(modifiedVolumesHotplug),
      tabLabel: VirtualMachineDetailsTabLabel.Disks,
      label: `${t('Make persistent disk')} - (${(modifiedVolumesHotplug || [])
        .map((volume) => volume?.name)
        .join(', ')})`,
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Disks));
      },
    },
    {
      hasPendingChange: modifiedHedlessMode,
      tabLabel: VirtualMachineDetailsTabLabel.Details,
      label: t('Headless mode'),
      handleAction: () => {
        history.push(getTabURL(vm, VirtualMachineDetailsTab.Details));
        createModal(({ isOpen, onClose }) => (
          <HardwareDevicesHeadlessModeModal
            vm={vm}
            isOpen={isOpen}
            onClose={onClose}
            vmi={vmi}
            onSubmit={onSubmit}
          />
        ));
      },
    },
  ];
};
