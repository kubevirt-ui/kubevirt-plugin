import React from 'react';

import AffinityModal from '@kubevirt-utils/components/AffinityModal/AffinityModal';
import CloudinitModal from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import NodeSelectorModal from '@kubevirt-utils/components/NodeSelectorModal/NodeSelectorModal';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
import VMSSHSecretModal from '@kubevirt-utils/components/VMSSHSecretModal/VMSSHSecretModal';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';

import { type PendingChange } from '../../utils/types';
import { type PendingChangeContext } from './types';

export const getSchedulingPendingChanges = ({
  createModal,
  createProps,
  onSubmit,
  params: {
    affinityChanged,
    authorizedSSHKeys,
    cloudInitChanged,
    hideYamlTab,
    nodes,
    nodeSelectorChanged,
    nodesLoaded,
    sshServiceChanged,
    t,
    tolerationsChanged,
    updateAuthorizedSSHKeys,
    vm,
    vmi,
  },
}: PendingChangeContext): PendingChange[] => [
  {
    ...createProps(VirtualMachineDetailsTab.Scheduling, () =>
      createModal(({ isOpen, onClose }) => (
        <NodeSelectorModal
          isOpen={isOpen}
          nodes={nodes}
          nodesLoaded={nodesLoaded}
          onClose={onClose}
          onSubmit={onSubmit}
          vm={vm}
        />
      )),
    ),
    hasPendingChange: nodeSelectorChanged,
    label: t('Node selector'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.InitialRun, () =>
      createModal(({ isOpen, onClose }) => (
        <CloudinitModal
          hideYAMLEditor={hideYamlTab}
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          vm={vm}
          vmi={vmi}
        />
      )),
    ),
    hasPendingChange: cloudInitChanged,
    label: t('Cloud-init'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.Scheduling, () =>
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
      )),
    ),
    hasPendingChange: tolerationsChanged,
    label: t('Tolerations'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.Scheduling, () =>
      createModal(({ isOpen, onClose }) => (
        <AffinityModal
          isOpen={isOpen}
          nodes={nodes}
          nodesLoaded={nodesLoaded}
          onClose={onClose}
          onSubmit={onSubmit}
          vm={vm}
        />
      )),
    ),
    hasPendingChange: affinityChanged,
    label: t('Affinity rules'),
  },
  {
    ...createProps(VirtualMachineDetailsTab.SSH, () =>
      createModal(({ isOpen, onClose }) => (
        <VMSSHSecretModal
          authorizedSSHKeys={authorizedSSHKeys}
          isOpen={isOpen}
          onClose={onClose}
          updateAuthorizedSSHKeys={updateAuthorizedSSHKeys}
          updateVM={onSubmit}
          vm={vm}
        />
      )),
    ),
    hasPendingChange: sshServiceChanged,
    label: t('Public SSH key'),
  },
];
