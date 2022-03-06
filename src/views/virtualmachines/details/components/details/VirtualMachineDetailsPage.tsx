import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem } from '@patternfly/react-core';

import VirtualMachineDetailsLeftGrid from './components/grid/leftGrid/VirtualMachineDetailsLeftGrid';
import VirtualMachineDetailsRightGrid from './components/grid/rightGrid/VirtualMachineDetailsRightGrid';

type VirtualMachineDetailsPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineDetailsPage: React.FC<VirtualMachineDetailsPageProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <ListPageHeader title={t('Virtual Machine Details')} />
      <ListPageBody>
        <Grid hasGutter>
          <VirtualMachineDetailsLeftGrid obj={obj} />
          <GridItem span={1}>{/* Spacer */}</GridItem>
          <VirtualMachineDetailsRightGrid obj={obj} />
        </Grid>
      </ListPageBody>
    </>
  );
};

export default VirtualMachineDetailsPage;
