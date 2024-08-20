import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  CPUComponent,
  CPUInputType,
  getUpdatedCPU,
} from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Grid, GridItem, NumberInput, Text } from '@patternfly/react-core';

import './VCPUInput.scss';

type vCPUInputProps = {
  cpu: V1CPU;
  setCPU: Dispatch<SetStateAction<V1CPU>>;
  setSelectedRadioOption: Dispatch<SetStateAction<CPUInputType>>;
};

const VCPUInput: FC<vCPUInputProps> = ({ cpu, setCPU, setSelectedRadioOption }) => {
  const { t } = useKubevirtTranslation();

  const handleButtonInput = (newCPU: V1CPU) => {
    setSelectedRadioOption(CPUInputType.editVCPU);
    setCPU(newCPU);
  };

  return (
    <Grid className="vcpu-input" hasGutter>
      <GridItem span={3}>
        <Text>{t('vCPU')}</Text>
      </GridItem>
      <GridItem span={9}>
        <NumberInput
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSelectedRadioOption(CPUInputType.editVCPU);
            const newNumber = +e?.target?.value;
            setCPU(getUpdatedCPU(cpu, newNumber, CPUComponent.sockets));
          }}
          onMinus={() =>
            handleButtonInput(getUpdatedCPU(cpu, +cpu?.sockets - 1, CPUComponent.sockets))
          }
          onPlus={() =>
            handleButtonInput(getUpdatedCPU(cpu, +cpu?.sockets + 1, CPUComponent.sockets))
          }
          inputName="cpu-input"
          min={1}
          value={cpu?.sockets}
        />
      </GridItem>
    </Grid>
  );
};

export default VCPUInput;
