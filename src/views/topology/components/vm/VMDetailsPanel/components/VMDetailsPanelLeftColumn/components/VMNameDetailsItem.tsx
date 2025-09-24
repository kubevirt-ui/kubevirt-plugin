import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';

import '../../../TopologyVMDetailsPanel.scss';

type VMNameDetailsItemProps = {
  vm: V1VirtualMachine;
};

const VMNameDetailsItem: FC<VMNameDetailsItemProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  return (
    <VirtualMachineDescriptionItem
      className="topology-vm-details-panel__item"
      descriptionData={getName(vm)}
      descriptionHeader={<span id="vm-name">{t('Name')}</span>}
    />
  );
};

export default VMNameDetailsItem;
