import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HostnameModal from '@kubevirt-utils/components/HostnameModal/HostnameModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getHostname } from '@kubevirt-utils/resources/vm';
import { updatedHostname } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import '../../../TopologyVMDetailsPanel.scss';

type VMHostnameDetailsItemProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VMHostnameDetailsItem: FC<VMHostnameDetailsItemProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const vmName = getName(vm);

  return (
    <VirtualMachineDescriptionItem
      onEditClick={() =>
        createModal(({ isOpen, onClose }) => (
          <HostnameModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={updatedHostname}
            vm={vm}
            vmi={vmi}
          />
        ))
      }
      className="topology-vm-details-panel__item"
      data-test-id={`${vmName}-hostname`}
      descriptionData={getHostname(vm) || vmName}
      descriptionHeader={t('Hostname')}
      isEdit
    />
  );
};

export default VMHostnameDetailsItem;
