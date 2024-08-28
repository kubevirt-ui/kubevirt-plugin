import React, { Dispatch, FC, SetStateAction } from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUTopologyHelperText from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/components/CPUTopologyInput/components/TotalCPUHelperText/CPUTopologyHelperText';
import { CPUComponent } from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { Grid } from '@patternfly/react-core';

import CPUComponentInput from './components/CPUComponentInput';

type CPUTopologyInputProps = {
  cpu: V1CPU;
  hide: boolean;
  isDisabled: boolean;
  setCPU: Dispatch<SetStateAction<V1CPU>>;
};

const CPUTopologyInput: FC<CPUTopologyInputProps> = ({ cpu, hide, isDisabled, setCPU }) => {
  if (hide) return null;

  return (
    <Grid hasGutter>
      <CPUComponentInput
        cpu={cpu}
        cpuComponent={CPUComponent.cores}
        isDisabled={isDisabled}
        setCPU={setCPU}
      />
      <CPUComponentInput
        cpu={cpu}
        cpuComponent={CPUComponent.sockets}
        isDisabled={isDisabled}
        setCPU={setCPU}
      />
      <CPUComponentInput
        cpu={cpu}
        cpuComponent={CPUComponent.threads}
        isDisabled={isDisabled}
        setCPU={setCPU}
      />
      <CPUTopologyHelperText cpu={cpu} />
    </Grid>
  );
};

export default CPUTopologyInput;
