import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { PageSection } from '@patternfly/react-core';

import SchedulingSection from './components/SchedulingSection/SchedulingSection';

type VirtualMachineSchedulingPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineSchedulingPage: React.FC<VirtualMachineSchedulingPageProps> = ({ obj: vm }) => {
  return (
    <div>
      <PageSection>
        <SchedulingSection vm={vm} pathname={location?.pathname} />
      </PageSection>
    </div>
  );
};

export default VirtualMachineSchedulingPage;
