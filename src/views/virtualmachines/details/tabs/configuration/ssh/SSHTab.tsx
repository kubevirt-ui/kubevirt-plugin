import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem, PageSection, Stack, Title } from '@patternfly/react-core';

import SSHTabAuthorizedSSHKey from './components/SSHTabAuthorizedSSHKey';
import SSHTabSSHAccess from './components/SSHTabSSHAccess';

type SSHTabProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const SSHTab: FC<SSHTabProps> = ({ obj: vm, vmi }) => {
  const { t } = useKubevirtTranslation();

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
      pathsToHighlight={PATHS_TO_HIGHLIGHT.SCRIPTS_TAB}
      resource={vm}
    >
      <PageSection>
        <Title headingLevel="h2">{t('SSH')}</Title>
        <Grid span={6}>
          <GridItem>
            <Stack hasGutter>
              <SSHTabSSHAccess vm={vm} vmi={vmi} />
              <SSHTabAuthorizedSSHKey vm={vm} />
            </Stack>
          </GridItem>
        </Grid>
      </PageSection>
    </SidebarEditor>
  );
};

export default SSHTab;
