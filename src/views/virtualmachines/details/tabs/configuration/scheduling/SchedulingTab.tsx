import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import SchedulingSection from './components/SchedulingSection';

type SchedulingTabProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const SchedulingTab: FC<SchedulingTabProps> = ({ obj: vm, vmi }) => {
  const onChangeResource = useCallback(
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
    <SidebarEditor
      onResourceUpdate={onChangeResource}
      pathsToHighlight={PATHS_TO_HIGHLIGHT.SCHEDULING_TAB}
      resource={vm}
    >
      {(resource) => (
        <PageSection>
          <SchedulingSection vm={resource} vmi={vmi} />
        </PageSection>
      )}
    </SidebarEditor>
  );
};

export default SchedulingTab;
