import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';

import { V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  convertTopologyToVCPUs,
  CPUComponent,
  getUpdatedCPU,
} from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, Grid, GridItem, NumberInput } from '@patternfly/react-core';

import './VCPUInput.scss';

type vCPUInputProps = {
  cpu: V1CPU;
  isDisabled: boolean;
  setCPU: Dispatch<SetStateAction<V1CPU>>;
};

const VCPUInput: FC<vCPUInputProps> = ({ cpu, isDisabled, setCPU }) => {
  const { t } = useKubevirtTranslation();

  const handleButtonInput = (newCPU: V1CPU) => {
    setCPU(newCPU);
  };

  return (
    <Grid className="vcpu-input" hasGutter>
      <GridItem span={3}>
        <Content component="p" disabled={isDisabled}>
          {t('vCPU')}
        </Content>
      </GridItem>
      <GridItem span={9}>
        <NumberInput
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
          isDisabled={isDisabled}
          min={1}
          value={convertTopologyToVCPUs(cpu)}
          widthChars={1}
        />
      </GridItem>
    </Grid>
  );
};

export default VCPUInput;
