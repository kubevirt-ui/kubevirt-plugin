import React, { Dispatch, FC, SetStateAction } from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUTopologyHelperText from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/components/CPUTopologyInput/components/TotalCPUHelperText/CPUTopologyHelperText';
import { CPUComponent } from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { Grid } from '@patternfly/react-core';

import CPUComponentInput from './components/CPUComponentInput';

type CPUTopologyInputProps = {
  cpu: V1CPU;
  cpuLimits: Record<string, number>;
  hide: boolean;
  isDisabled: boolean;
  setCPU: Dispatch<SetStateAction<V1CPU>>;
};

const CPUTopologyInput: FC<CPUTopologyInputProps> = ({
  cpu,
  cpuLimits,
  hide,
  isDisabled,
  setCPU,
}) => {
  if (hide) return null;

  return (
    <Grid hasGutter>
      <CPUComponentInput
        cpu={cpu}
        cpuComponent={CPUComponent.cores}
        cpuLimits={cpuLimits}
        isDisabled={isDisabled}
        setCPU={setCPU}
      />
      <CPUComponentInput
        cpu={cpu}
        cpuComponent={CPUComponent.sockets}
        cpuLimits={cpuLimits}
        isDisabled={isDisabled}
        setCPU={setCPU}
      />
      <CPUComponentInput
        cpu={cpu}
        cpuComponent={CPUComponent.threads}
        cpuLimits={cpuLimits}
        isDisabled={isDisabled}
        setCPU={setCPU}
      />
      <CPUTopologyHelperText cpu={cpu} />
    </Grid>
  );
};

export default CPUTopologyInput;
