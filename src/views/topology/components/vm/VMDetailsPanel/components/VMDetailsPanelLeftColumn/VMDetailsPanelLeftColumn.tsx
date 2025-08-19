import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import { DescriptionList } from '@patternfly/react-core';

import VMAnnotationsDetailsItem from './components/VMAnnotationsDetailsItem';
import VMCreatedTimestampDetailsItem from './components/VMCreatedTimestampDetailsItem';
import VMDescriptionDetailsItem from './components/VMDescriptionDetailsItem';
import VMLabelsDetailsItem from './components/VMLabelsDetailsItem';
import VMNameDetailsItem from './components/VMNameDetailsItem';
import VMNamespaceDetailsItem from './components/VMNamespaceDetailsItem';
import VMOperatingSystemDetailsItem from './components/VMOperatingSystemDetailsItem';
import VMTemplateDetailsItem from './components/VMTemplateDetailsItem/VMTemplateDetailsItem';

import '../../TopologyVMDetailsPanel.scss';

type VMResourceSummaryProps = {
  vm?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const VMDetailsPanelLeftColumn: FC<VMResourceSummaryProps> = ({ vm, vmi }) => (
  <DescriptionList
    className="pf-v6-c-description-list__group"
    data-test-id="details-panel-left-column"
  >
    <VMNameDetailsItem vm={vm} />
    <VMNamespaceDetailsItem vm={vm} />
    <VMLabelsDetailsItem vm={vm} />
    <VMAnnotationsDetailsItem vm={vm} />
    <VMDescriptionDetailsItem vm={vm} />
    <VMOperatingSystemDetailsItem vm={vm} vmi={vmi} />
    <VMTemplateDetailsItem vm={vm} />
    <VMCreatedTimestampDetailsItem vm={vm} />
    <OwnerDetailsItem className="topology-vm-details-panel__item" obj={vm} />
  </DescriptionList>
);

export default VMDetailsPanelLeftColumn;
