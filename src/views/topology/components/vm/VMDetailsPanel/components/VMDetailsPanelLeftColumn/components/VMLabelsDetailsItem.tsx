import React, { FC } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItemLabels from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemLabels';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { updateLabels } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import '../../../TopologyVMDetailsPanel.scss';

type VMLabelsDetailsItemProps = {
  vm: V1VirtualMachine;
};

const VMLabelsDetailsItem: FC<VMLabelsDetailsItemProps> = ({ vm }) => {
  return (
    <DescriptionItemLabels
      className="topology-vm-details-panel__item"
      descriptionHeaderWrapper={(children) => <SearchItem id="labels">{children}</SearchItem>}
      model={VirtualMachineModel}
      onLabelsSubmit={(labels) => updateLabels(vm, labels)}
      resource={vm}
    />
  );
};

export default VMLabelsDetailsItem;
