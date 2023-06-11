import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Divider, PageSection } from '@patternfly/react-core';

import Details from './components/Details/Details';
import Services from './components/Services/Services';
import ActiveUserList from './components/UserList/ActiveUserList';

import './virtual-machines-instance-details-tab.scss';

type VirtualMachinesInstancePageDetailsTabProps = RouteComponentProps & {
  obj: V1VirtualMachineInstance;
};
const VirtualMachinesInstancePageDetailsTab: React.FC<
  VirtualMachinesInstancePageDetailsTabProps
> = ({ location, obj: vmi }) => {
  return (
    <div className="VirtualMachinesInstanceDetailsTab">
      <PageSection>
        <Details pathname={location?.pathname} vmi={vmi} />
      </PageSection>
      <Divider />
      <PageSection>
        <Services pathname={location?.pathname} vmi={vmi} />
      </PageSection>
      <Divider />
      <PageSection>
        <ActiveUserList pathname={location?.pathname} vmi={vmi} />
      </PageSection>
    </div>
  );
};

export default VirtualMachinesInstancePageDetailsTab;
