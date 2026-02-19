import React, { FC } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { Divider, PageSection } from '@patternfly/react-core';

import Details from './components/Details/Details';
import Services from './components/Services/Services';
import ActiveUserList from './components/UserList/ActiveUserList';

import './virtual-machines-instance-details-tab.scss';

type VirtualMachinesInstancePageDetailsTabProps = {
  obj: V1VirtualMachineInstance;
};
const VirtualMachinesInstancePageDetailsTab: FC<VirtualMachinesInstancePageDetailsTabProps> = ({
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
      <PageSection id="logged-in-users">
        <ActiveUserList pathname={location?.pathname} vmi={vmi} />
      </PageSection>
    </div>
  );
};

export default VirtualMachinesInstancePageDetailsTab;
