import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Divider, PageSection } from '@patternfly/react-core';

import Scheduling from './components/Scheduling/Scheduling';
import VirtualMachinesInstancesPageDetailsTabDetails from './VirtualMachinesInstancesPageDetailsTabDetails';

import './virtual-machines-instance-details-tab.scss';

type VirtualMachinesInstancePageDetailsTabProps = RouteComponentProps & {
  obj: V1VirtualMachineInstance;
};
const VirtualMachinesInstancePageDetailsTab: React.FC<
  VirtualMachinesInstancePageDetailsTabProps
> = ({ obj: vmi, location }) => {
  return (
    <div className="VirtualMachinesInstanceDetailsTab co-m-pane__body">
      <PageSection>
        <VirtualMachinesInstancesPageDetailsTabDetails vmi={vmi} pathname={location?.pathname} />
      </PageSection>
      <Divider />
      <PageSection>
        <Scheduling vmi={vmi} pathname={location?.pathname} />
      </PageSection>
      <Divider />
      <PageSection>Services</PageSection>
    </div>
  );
};

export default VirtualMachinesInstancePageDetailsTab;
