import AffinityModal from '@kubevirt-utils/components/AffinityModal/AffinityModal';
import { produceVMWithAffinity } from '@kubevirt-utils/components/AffinityModal/utils/utils';
import CloudinitModal from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import NodeSelectorModal from '@kubevirt-utils/components/NodeSelectorModal/NodeSelectorModal';
import { produceVMWithNodeSelector } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
import { produceVMWithTolerations } from '@kubevirt-utils/components/TolerationsModal/utils/utils';
import VMSSHSecretModal from '@kubevirt-utils/components/VMSSHSecretModal/VMSSHSecretModal';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { getAffinity, getNodeSelector, getTolerations } from '@kubevirt-utils/resources/vm';

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
    nodeSelectorChanged,
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
          nodeSelector={getNodeSelector(vm)}
          onClose={onClose}
          onSubmit={onSubmit}
          produceUpdatedResource={(selectorLabels) => produceVMWithNodeSelector(vm, selectorLabels)}
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
          initialTolerationsProp={getTolerations(vm)}
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          produceUpdatedResource={(tolerations) => produceVMWithTolerations(vm, tolerations)}
          showPendingChangesAlert={!!vmi}
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
          initialAffinity={getAffinity(vm)}
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          produceUpdatedResource={(affinity) => produceVMWithAffinity(vm, affinity)}
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
