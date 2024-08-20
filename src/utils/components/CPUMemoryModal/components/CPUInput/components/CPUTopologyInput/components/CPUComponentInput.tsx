import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getCPUComponentTitle } from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/components/CPUTopologyInput/utils/utils';
import {
  CPUComponent,
  getUpdatedCPU,
} from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { GridItem, NumberInput, Text } from '@patternfly/react-core';

type CPUComponentInputProps = {
  cpu: V1CPU;
  cpuComponent: CPUComponent;
  setCPU: Dispatch<SetStateAction<V1CPU>>;
};

const CPUComponentInput: FC<CPUComponentInputProps> = ({ cpu, cpuComponent, setCPU }) => {
  return (
    <>
      <GridItem span={3}>
        <Text>{getCPUComponentTitle(cpuComponent)}</Text>
      </GridItem>
      <GridItem span={9}>
        <NumberInput
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newNumber = +e?.target?.value;
            setCPU(getUpdatedCPU(cpu, newNumber, cpuComponent));
          }}
          inputName="cpu-sockets-input"
          min={1}
          onMinus={() => setCPU(getUpdatedCPU(cpu, +cpu?.[cpuComponent] - 1, cpuComponent))}
          onPlus={() => setCPU(getUpdatedCPU(cpu, +cpu?.[cpuComponent] + 1, cpuComponent))}
          value={cpu?.[cpuComponent]}
        />
      </GridItem>
    </>
  );
};

export default CPUComponentInput;
