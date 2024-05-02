import React, { FC } from 'react';
import classNames from 'classnames';

import {
  V1Interface,
  V1Network,
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import WithPermissionTooltip from '@kubevirt-utils/components/WithPermissionTooltip/WithPermissionTooltip';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePermissions from '@kubevirt-utils/hooks/usePermissions/usePermissions';
import { ListPageCreateButton } from '@openshift-console/dynamic-plugin-sdk';

import VirtualMachinesNetworkInterfaceModal from './modal/VirtualMachinesNetworkInterfaceModal';

type AddNetworkInterfaceButtonProps = {
  onAddNetworkInterface?: (
    updatedNetworks: V1Network[],
    updatedInterfaces: V1Interface[],
  ) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const AddNetworkInterfaceButton: FC<AddNetworkInterfaceButtonProps> = ({
  onAddNetworkInterface,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
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
              onAddNetworkInterface={onAddNetworkInterface}
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
