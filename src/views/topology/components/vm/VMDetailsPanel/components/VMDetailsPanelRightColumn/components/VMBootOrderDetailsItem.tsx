import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import BootOrderSummary from '@kubevirt-utils/components/BootOrder/BootOrderSummary';
import BootOrderModal from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { updateBootOrder } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import '../../../TopologyVMDetailsPanel.scss';

type VMBootOrderDetailsItemProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VMBootOrderDetailsItem: FC<VMBootOrderDetailsItemProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <VirtualMachineDescriptionItem
      onEditClick={() =>
        createModal((props) => (
          <BootOrderModal
            {...props}
            onSubmit={(updatedVM: V1VirtualMachine) => updateBootOrder(updatedVM)}
            vm={vm}
            vmi={vmi}
          />
        ))
      }
      className="topology-vm-details-panel__item"
      data-test-id={`${getName(vm)}-boot-order`}
      descriptionData={<BootOrderSummary vm={vm} />}
      descriptionHeader={t('Boot order')}
      isEdit
    />
  );
};

export default VMBootOrderDetailsItem;
