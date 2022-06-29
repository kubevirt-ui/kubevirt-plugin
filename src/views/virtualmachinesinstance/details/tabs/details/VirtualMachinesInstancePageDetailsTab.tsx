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
> = ({ obj: vmi, location }) => {
  return (
    <div className="VirtualMachinesInstanceDetailsTab">
      <PageSection>
        <Details vmi={vmi} pathname={location?.pathname} />
      </PageSection>
      <Divider />
      <PageSection>
        <Services vmi={vmi} pathname={location?.pathname} />
      </PageSection>
      <Divider />
      <PageSection>
        <ActiveUserList vmi={vmi} pathname={location?.pathname} />
      </PageSection>
    </div>
  );
};

export default VirtualMachinesInstancePageDetailsTab;
