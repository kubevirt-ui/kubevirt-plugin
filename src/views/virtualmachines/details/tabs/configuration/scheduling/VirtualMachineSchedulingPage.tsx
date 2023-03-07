import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import SchedulingSection from './components/SchedulingSection/SchedulingSection';

type VirtualMachineSchedulingPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineSchedulingPage: React.FC<VirtualMachineSchedulingPageProps> = ({ obj: vm }) => {
  const onChangeResource = React.useCallback(
    (updatedVM: V1VirtualMachine) =>
      k8sUpdate({
        model: VirtualMachineModel,
        data: updatedVM,
        ns: updatedVM?.metadata?.namespace,
        name: updatedVM?.metadata?.name,
      }),
    [],
  );

  return (
    <PageSection>
      <SidebarEditor
        resource={vm}
        onResourceUpdate={onChangeResource}
        pathsToHighlight={PATHS_TO_HIGHLIGHT.SCHEDULING_TAB}
      >
        {(resource) => <SchedulingSection vm={resource} pathname={location?.pathname} />}
      </SidebarEditor>
    </PageSection>
  );
};

export default VirtualMachineSchedulingPage;
