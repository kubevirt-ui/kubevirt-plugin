import React, { FC } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItemAnnotations from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemAnnotations';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { updateAnnotation } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import '../../../TopologyVMDetailsPanel.scss';

type VMAnnotationsDetailsItemProps = {
  vm: V1VirtualMachine;
};

const VMAnnotationsDetailsItem: FC<VMAnnotationsDetailsItemProps> = ({ vm }) => {
  return (
    <DescriptionItemAnnotations
      className="topology-vm-details-panel__item"
      descriptionHeaderWrapper={(children) => <SearchItem id="metadata">{children}</SearchItem>}
      model={VirtualMachineModel}
      onAnnotationsSubmit={(annotations) => updateAnnotation(vm, annotations)}
      resource={vm}
    />
  );
};

export default VMAnnotationsDetailsItem;
