import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getCPUComponentTitle } from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/components/CPUTopologyInput/utils/utils';
import {
  CPUComponent,
  getUpdatedCPU,
} from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { Content, GridItem, NumberInput } from '@patternfly/react-core';

type CPUComponentInputProps = {
  cpu: V1CPU;
  cpuComponent: CPUComponent;
  isDisabled: boolean;
  setCPU: Dispatch<SetStateAction<V1CPU>>;
  templateName?: string;
};

const CPUComponentInput: FC<CPUComponentInputProps> = ({
  cpu,
  cpuComponent,
  isDisabled,
  setCPU,
  templateName,
}) => {
  // Windows 11 template requires minimum 2 cores
  const isWindows11Template = templateName === 'windows11-desktop-medium';
  const minValue = cpuComponent === CPUComponent.cores && isWindows11Template ? 2 : 1;

  return (
    <>
      <GridItem span={3}>
        <Content component="p" disabled={isDisabled}>
          {getCPUComponentTitle(cpuComponent)}
        </Content>
      </GridItem>
      <GridItem span={9}>
        <NumberInput
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const newNumber = +e?.target?.value;
            if (newNumber >= minValue) {
              setCPU(getUpdatedCPU(cpu, newNumber, cpuComponent));
            }
          }}
          onMinus={() => {
            const newValue = +cpu?.[cpuComponent] - 1;
            if (newValue >= minValue) {
              setCPU(getUpdatedCPU(cpu, newValue, cpuComponent));
            }
          }}
          inputName="cpu-sockets-input"
          isDisabled={isDisabled}
          min={minValue}
          onPlus={() => setCPU(getUpdatedCPU(cpu, +cpu?.[cpuComponent] + 1, cpuComponent))}
          value={cpu?.[cpuComponent]}
          widthChars={1}
        />
      </GridItem>
    </>
  );
};

export default CPUComponentInput;
