import React, { FCC } from 'react';
import { useLocation } from 'react-router';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { Divider, PageSection } from '@patternfly/react-core';

import Details from './components/Details/Details';
import Services from './components/Services/Services';
import ActiveUserList from './components/UserList/ActiveUserList';

import './virtual-machines-instance-details-tab.scss';

type VirtualMachinesInstancePageDetailsTabProps = {
  obj: V1VirtualMachineInstance;
};
const VirtualMachinesInstancePageDetailsTab: FCC<VirtualMachinesInstancePageDetailsTabProps> = ({
  obj: vmi,
}) => {
  const location = useLocation();

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
