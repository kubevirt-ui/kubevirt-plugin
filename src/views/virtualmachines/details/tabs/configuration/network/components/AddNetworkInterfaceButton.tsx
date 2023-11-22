import React, { FC } from 'react';
import classNames from 'classnames';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import WithPermissionTooltip from '@kubevirt-utils/components/WithPermissionTooltip/WithPermissionTooltip';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePermissions from '@kubevirt-utils/hooks/usePermissions/usePermissions';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';

import VirtualMachinesNetworkInterfaceModal from './modal/VirtualMachinesNetworkInterfaceModal';

type AddNetworkInterfaceButtonProps = {
  vm: V1VirtualMachine;
};

const AddNetworkInterfaceButton: FC<AddNetworkInterfaceButtonProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { vmi } = useVMIAndPodsForVM(vm?.metadata?.name, vm?.metadata?.namespace);
  const { capabilitiesData } = usePermissions();
  const isAddNetworkDisabled = !capabilitiesData?.attacheNetworks?.allowed;
  const actionText = t('Add network interface');

  return (
    <WithPermissionTooltip allowed={!isAddNetworkDisabled}>
      <ListPageCreateButton
        onClick={() =>
          !isAddNetworkDisabled &&
          createModal(({ isOpen, onClose }) => (
            <VirtualMachinesNetworkInterfaceModal
              headerText={actionText}
              isOpen={isOpen}
              onClose={onClose}
              vm={vm}
              vmi={vmi}
            />
          ))
        }
        className={classNames('add-network-interface-button', { isDisabled: isAddNetworkDisabled })}
      >
        {actionText}
      </ListPageCreateButton>
    </WithPermissionTooltip>
  );
};

export default AddNetworkInterfaceButton;
