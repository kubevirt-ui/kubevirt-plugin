import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Divider, PageSection } from '@patternfly/react-core';

import DetailsSection from './components/sections/DetailsSection';
import ServicesSection from './components/sections/ServicesSection';
import ActiveUserListSection from './components/sections/UserList/ActiveUserListSection';

type VirtualMachineDetailsPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineDetailsPage: React.FC<VirtualMachineDetailsPageProps> = ({ obj: vm }) => {
  return (
    <div>
      <PageSection>
        <DetailsSection vm={vm} pathname={location?.pathname} />
      </PageSection>
      <Divider />
      <PageSection>
        <ServicesSection vm={vm} pathname={location?.pathname} />
      </PageSection>
      <Divider />
      <PageSection>
        <ActiveUserListSection vm={vm} pathname={location?.pathname} />
      </PageSection>
    </div>
  );
};

export default VirtualMachineDetailsPage;
