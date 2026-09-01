import React, { type FC, type FormEvent } from 'react';

import { type V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCPUComponentTitle } from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/components/CPUTopologyInput/utils/utils';
import {
  type CPUComponent,
  getUpdatedCPU,
} from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { Content, GridItem, NumberInput } from '@patternfly/react-core';

type CPUComponentInputProps = {
  cpu: V1CPU;
  cpuComponent: CPUComponent;
  cpuLimits?: Record<string, number>;
  isDisabled: boolean;
  setCPU: (cpu: V1CPU) => void;
};

const CPUComponentInput: FC<CPUComponentInputProps> = ({
  cpu,
  cpuComponent,
  cpuLimits,
  isDisabled,
  setCPU,
}) => {
  // Get minimum value from validation rules
  const minValue = cpuLimits?.[cpuComponent] || 1;

  const updateCPU = (newValue: number): void => {
    if (newValue >= minValue) {
      setCPU(getUpdatedCPU(cpu, newValue, cpuComponent));
    }
  };

  return (
    <>
      <GridItem span={3}>
        <Content component="p" disabled={isDisabled}>
          {getCPUComponentTitle(cpuComponent)}
        </Content>
      </GridItem>
      <GridItem span={9}>
        <NumberInput
          inputName="cpu-sockets-input"
          isDisabled={isDisabled}
          min={minValue}
          onChange={(e: FormEvent<HTMLInputElement>) => {
            updateCPU(+e.currentTarget.value);
          }}
          onMinus={() => {
            updateCPU((cpu[cpuComponent] ?? 1) - 1);
          }}
          onPlus={() => {
            updateCPU((cpu[cpuComponent] ?? 1) + 1);
          }}
          value={cpu[cpuComponent]}
          widthChars={1}
        />
      </GridItem>
    </>
  );
};

export default CPUComponentInput;
