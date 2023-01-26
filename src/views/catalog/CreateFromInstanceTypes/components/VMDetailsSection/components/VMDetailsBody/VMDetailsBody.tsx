import React, { Dispatch, SetStateAction } from 'react';

import { InstanceTypeState } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { Grid, GridItem } from '@patternfly/react-core';

import DetailsLeftGrid from './components/DetailsLeftGrid';
import DetailsRightGrid from './components/DetailsRightGrid';

import './VMDetailsBody.scss';

type VMDetailsBodyProps = {
  vmName: string;
  setVMName: Dispatch<SetStateAction<string>>;
  namespace: string;
  bootSource: V1beta1DataSource;
  instancetype: InstanceTypeState;
};

const VMDetailsBody: React.FC<VMDetailsBodyProps> = ({
  vmName,
  setVMName,
  namespace,
  bootSource,
  instancetype,
}) => (
  <div className="instancetypes-vm-details-body">
    <Grid hasGutter>
      <GridItem span={3}>
        <DetailsLeftGrid
          vmName={vmName}
          setVMName={setVMName}
          bootSource={bootSource}
          instancetype={instancetype}
        />
      </GridItem>
      <GridItem span={1}>{/* Spacer */}</GridItem>
      <GridItem span={3}>
        <DetailsRightGrid bootSource={bootSource} namespace={namespace} />
      </GridItem>
    </Grid>
  </div>
);

export default VMDetailsBody;
