import React from 'react';
import { FC, useMemo, useState } from 'react';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import {
  updateInterfacesForDeletion,
  updateVMNetworkInterfaces,
} from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNetworks } from '@kubevirt-utils/resources/vm';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import VirtualMachinesEditNetworkInterfaceModal from '../modal/VirtualMachinesEditNetworkInterfaceModal';

type NetworkInterfaceActionsProps = {
  nicName: string;
  nicPresentation: NetworkPresentation;
  vm: V1VirtualMachine;
};

const NetworkInterfaceActions: FC<NetworkInterfaceActionsProps> = ({
  nicName,
  nicPresentation,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const deleteModalHeader = t('Delete NIC?');
  const editBtnText = t('Edit');
  const deleteBtnText = t('Delete');

  const resultVirtualMachine = useMemo(() => {
    const isHotPlug = Boolean(nicPresentation?.iface?.bridge);
    const networks = isHotPlug
      ? getNetworks(vm)
      : getNetworks(vm)?.filter(({ name }) => name !== nicName);
    const interfaces = updateInterfacesForDeletion(isHotPlug, nicName, vm);

    return updateVMNetworkInterfaces(vm, networks, interfaces);
  }, [nicName, nicPresentation, vm]);

  const onEditModalOpen = () => {
    createModal(({ isOpen, onClose }) => (
      <VirtualMachinesEditNetworkInterfaceModal
        isOpen={isOpen}
        nicPresentation={nicPresentation}
        onClose={onClose}
        vm={vm}
      />
    ));
    setIsDropdownOpen(false);
  };

  const onDeleteModalOpen = () => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1VirtualMachine>
        onSubmit={(obj) =>
          k8sUpdate({
            data: obj,
            model: VirtualMachineModel,
            name: obj?.metadata?.name,
            ns: obj?.metadata?.namespace,
          })
        }
        headerText={deleteModalHeader}
        isOpen={isOpen}
        obj={resultVirtualMachine}
        onClose={onClose}
        submitBtnText={deleteBtnText}
        submitBtnVariant={ButtonVariant.danger}
      >
        <span>
          {isRunning(vm) && (
            <Alert
              title={t(
                'Deleting a network interface is supported only on VirtualMachines that were created in versions greater than 4.13 or for network interfaces that were added to the VirtualMachine in these versions.',
              )}
              component={'h6'}
              isInline
              variant={AlertVariant.warning}
            />
          )}
          <br />
          <ConfirmActionMessage
            obj={{ metadata: { name: nicName, namespace: vm?.metadata?.namespace } }}
          />
        </span>
      </TabModal>
    ));
    setIsDropdownOpen(false);
  };

  const items = [
    <DropdownItem key="network-interface-edit" onClick={onEditModalOpen}>
      {editBtnText}
    </DropdownItem>,
    <DropdownItem key="network-interface-delete" onClick={onDeleteModalOpen}>
      {deleteBtnText}
    </DropdownItem>,
  ];

  return (
    <>
      <Dropdown
        dropdownItems={items}
        isOpen={isDropdownOpen}
        isPlain
        onSelect={() => setIsDropdownOpen(false)}
        position={DropdownPosition.right}
        toggle={<KebabToggle id="toggle-id-6" onToggle={setIsDropdownOpen} />}
      />
    </>
  );
};

export default NetworkInterfaceActions;
