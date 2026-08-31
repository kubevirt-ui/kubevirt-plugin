import React, { type FC, type FormEvent } from 'react';

import { type V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  convertTopologyToVCPUs,
  CPUComponent,
  getUpdatedCPU,
} from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { NumberInput } from '@patternfly/react-core';

type VCPUInputProps = {
  cpu: V1CPU;
  isDisabled: boolean;
  setCPU: (cpu: V1CPU) => void;
};

const VCPUInput: FC<VCPUInputProps> = ({ cpu, isDisabled, setCPU }) => {
  const handleButtonInput = (newCPU: V1CPU): void => {
    setCPU(newCPU);
  };

  return (
    <NumberInput
      inputName="cpu-input"
      isDisabled={isDisabled}
      min={1}
      onChange={(e: FormEvent<HTMLInputElement>) => {
        const newNumber = +e.currentTarget.value;
        setCPU(getUpdatedCPU(cpu, newNumber, CPUComponent.sockets));
      }}
      onMinus={() =>
        handleButtonInput(getUpdatedCPU(cpu, (cpu.sockets ?? 1) - 1, CPUComponent.sockets))
      }
      onPlus={() =>
        handleButtonInput(getUpdatedCPU(cpu, (cpu.sockets ?? 1) + 1, CPUComponent.sockets))
      }
      value={convertTopologyToVCPUs(cpu)}
      widthChars={1}
    />
  );
};

export default VCPUInput;
