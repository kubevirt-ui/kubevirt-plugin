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
  name: string;
  ns: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineSchedulingPage: React.FC<VirtualMachineSchedulingPageProps> = ({ obj: vm }) => {
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
    <PageSection>
      <SidebarEditor
        onResourceUpdate={onChangeResource}
        pathsToHighlight={PATHS_TO_HIGHLIGHT.SCHEDULING_TAB}
        resource={vm}
      >
        {(resource) => <SchedulingSection pathname={location?.pathname} vm={resource} />}
      </SidebarEditor>
    </PageSection>
  );
};

export default VirtualMachineSchedulingPage;
