import { useCallback } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualMachineModel } from '@kubevirt-utils/models';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { type Action } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/actions';

import DisconnectVMModal, {
  type DisconnectVMModalProps,
} from '../actions/components/DisconnectVMModal';
import MoveVMModal, { type MoveVMModalProps } from '../actions/components/MoveVMModal';

const useConnectedVMActions = (vmNetworkName: string | undefined) => {
  const { t } = useKubevirtTranslation();
  const createModal = useModal();

  const createActions = useCallback(
    (vmList: V1VirtualMachine[]): Action[] => {
      const vm = vmList[0];
      const accessReview = vm ? asAccessReview(VirtualMachineModel, vm, 'patch') : undefined;

      return [
        {
          accessReview,
          cta: () =>
            createModal<DisconnectVMModalProps>(DisconnectVMModal, {
              currentNetwork: vmNetworkName,
              vms: vmList,
            }),
          id: 'disconnect-vm',
          label: t('Disconnect virtual machine from network'),
        },
        {
          accessReview,
          cta: () =>
            createModal<MoveVMModalProps>(MoveVMModal, {
              currentNetwork: vmNetworkName,
              vms: vmList,
            }),
          id: 'move-vm',
          label: t('Move virtual machine to another network'),
        },
      ];
    },
    [createModal, vmNetworkName, t],
  );

  return createActions;
};

export default useConnectedVMActions;
