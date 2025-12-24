import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getCPUComponentTitle } from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/components/CPUTopologyInput/utils/utils';
import {
  CPUComponent,
  DEFAULT_CPU_COMPONENT_VALUE,
  getUpdatedCPU,
} from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { GridItem, NumberInput, Text } from '@patternfly/react-core';

type CPUComponentInputProps = {
  cpu: V1CPU;
  cpuComponent: CPUComponent;
  cpuLimits?: Record<string, number>;
  isDisabled: boolean;
  setCPU: Dispatch<SetStateAction<V1CPU>>;
};

const CPUComponentInput: FC<CPUComponentInputProps> = ({
  cpu,
  cpuComponent,
  cpuLimits,
  isDisabled,
  setCPU,
}) => {
  const minValue = cpuLimits?.[cpuComponent] || DEFAULT_CPU_COMPONENT_VALUE;

  const updateCPU = (newValue: number) => {
    if (newValue >= minValue) {
      setCPU(getUpdatedCPU(cpu, newValue, cpuComponent));
    }
  };

  return (
    <>
      <GridItem span={3}>
        <Text disabled={isDisabled}>{getCPUComponentTitle(cpuComponent)}</Text>
      </GridItem>
      <GridItem span={9}>
        <NumberInput
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            updateCPU(+event?.target?.value);
          }}
          onMinus={() => {
            updateCPU(+cpu?.[cpuComponent] - 1);
          }}
          onPlus={() => {
            updateCPU(+cpu?.[cpuComponent] + 1);
          }}
          inputName="cpu-sockets-input"
          isDisabled={isDisabled}
          min={minValue}
          value={cpu?.[cpuComponent]}
        />
      </GridItem>
    </>
  );
};

export default CPUComponentInput;
