import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUHelperText from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/CPUHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { NumberInput, Title, TitleSizes } from '@patternfly/react-core';

import './CPUInput.scss';

type CPUInputProps = {
  cpuSockets: number;
  setCPUSockets: Dispatch<SetStateAction<number>>;
  vm: V1VirtualMachine;
};

const CPUInput: FC<CPUInputProps> = ({ cpuSockets, setCPUSockets, vm }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="input-cpu">
      <Title headingLevel="h6" size={TitleSizes.md}>
        {t('CPU sockets')}
      </Title>
      <NumberInput
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const newNumber = +e?.target?.value;
          setCPUSockets((cpus) => (newNumber > 0 ? newNumber : cpus));
        }}
        inputName="cpu-input"
        min={1}
        onMinus={() => setCPUSockets((cpus) => +cpus - 1)}
        onPlus={() => setCPUSockets((cpus) => +cpus + 1)}
        value={cpuSockets}
      />
      <CPUHelperText cpu={getCPU(vm)} sockets={cpuSockets} />
    </div>
  );
};

export default CPUInput;
