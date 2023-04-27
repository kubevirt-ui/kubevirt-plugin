import React, { Dispatch, SetStateAction } from 'react';

import { SSHSecretCredentials } from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/components/SSHKeySection/utils/types';
import { InstanceTypeState } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { Grid, GridItem } from '@patternfly/react-core';

import DetailsLeftGrid from './components/DetailsLeftGrid';
import DetailsRightGrid from './components/DetailsRightGrid';

import './VMDetailsBody.scss';

type VMDetailsBodyProps = {
  vmName: string;
  setVMName: Dispatch<SetStateAction<string>>;
  namespace: string;
  bootSource: BootableVolume;
  instancetype: InstanceTypeState;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
  sshSecretCredentials: SSHSecretCredentials;
};

const VMDetailsBody: React.FC<VMDetailsBodyProps> = ({
  vmName,
  setVMName,
  namespace,
  bootSource,
  instancetype,
  pvcSource,
  sshSecretCredentials,
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
        <DetailsRightGrid
          pvcSource={pvcSource}
          namespace={namespace}
          sshSecretCredentials={sshSecretCredentials}
        />
      </GridItem>
    </Grid>
  </div>
);

export default VMDetailsBody;
