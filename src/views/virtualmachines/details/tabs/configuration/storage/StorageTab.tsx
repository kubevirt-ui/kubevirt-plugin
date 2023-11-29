import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import EnvironmentForm from '@kubevirt-utils/components/EnvironmentEditor/EnvironmentForm';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Divider, Grid, GridItem, PageSection } from '@patternfly/react-core';

import DiskList from './components/tables/disk/DiskList';

type StorageTabProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const StorageTab: FC<StorageTabProps> = ({ obj: vm, vmi }) => {
  const onSubmit = useCallback(
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
      onResourceUpdate={onSubmit}
      pathsToHighlight={[...PATHS_TO_HIGHLIGHT.DISKS_TAB, ...PATHS_TO_HIGHLIGHT.ENV_TAB]}
      resource={vm}
    >
      <Grid hasGutter>
        <GridItem>
          <PageSection>
            <DiskList vm={vm} vmi={vmi} />
          </PageSection>
        </GridItem>
        <GridItem>
          <Divider />
        </GridItem>
        <GridItem>
          <PageSection>
            <EnvironmentForm updateVM={onSubmit} vm={vm} />
          </PageSection>
        </GridItem>
      </Grid>
    </SidebarEditor>
  );
};

export default StorageTab;
