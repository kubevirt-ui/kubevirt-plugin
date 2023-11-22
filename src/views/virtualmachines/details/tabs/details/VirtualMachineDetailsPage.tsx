import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Divider, PageSection } from '@patternfly/react-core';

import DetailsSection from './components/sections/DetailsSection';
import ServicesSection from './components/sections/ServicesSection';
import ActiveUserListSection from './components/sections/UserList/ActiveUserListSection';

type VirtualMachineDetailsPageProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineDetailsPage: React.FC<VirtualMachineDetailsPageProps> = ({ obj: vm }) => {
  const onChangeResource = React.useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        data: updatedVM,
        model: VirtualMachineModel,
        name: updatedVM?.metadata?.name,
        ns: updatedVM?.metadata?.namespace,
      }),
    [],
  );

  return (
    <div>
      <PageSection>
        <SidebarEditor
          onResourceUpdate={onChangeResource}
          pathsToHighlight={PATHS_TO_HIGHLIGHT.DETAILS_TAB}
          resource={vm}
        >
          {(resource) => <DetailsSection pathname={location?.pathname} vm={resource} />}
        </SidebarEditor>
      </PageSection>
      <Divider />
      <PageSection>
        <ServicesSection pathname={location?.pathname} vm={vm} />
      </PageSection>
      <Divider />
      <PageSection>
        <ActiveUserListSection pathname={location?.pathname} vm={vm} />
      </PageSection>
    </div>
  );
};

export default VirtualMachineDetailsPage;
