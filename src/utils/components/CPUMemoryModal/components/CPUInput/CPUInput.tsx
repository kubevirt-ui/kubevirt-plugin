import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VCPUInput from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/components/vCPUInput/VCPUInput';
import {
  convertTopologyToVCPUs,
  CPUInputType,
  formatVCPUsAsSockets,
} from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Popover, Radio, Title, TitleSizes } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import CPUTopologyInput from './components/CPUTopologyInput/CPUTopologyInput';
import CPUHelperText from './components/vCPUInput/components/CPUHelperText/CPUHelperText';

import './CPUInput.scss';

type CPUInputProps = {
  currentCPU: V1CPU;
  setUserEnteredCPU: Dispatch<SetStateAction<V1CPU>>;
  userEnteredCPU: V1CPU;
};

const CPUInput: FC<CPUInputProps> = ({ currentCPU, setUserEnteredCPU, userEnteredCPU }) => {
  const { t } = useKubevirtTranslation();
  const [selectedRadioOption, setSelectedRadioOption] = useState<CPUInputType>(
    CPUInputType.editVCPU,
  );

  const radioInputName = 'cpu-input-type';

  return (
    <div className="cpu-input">
      <Title className="cpu-input__title" headingLevel="h6" size={TitleSizes.md}>
        {t('CPU')}
        <Popover
          bodyContent={t(
            'As a default, the VirtualMachine CPU uses sockets to enable hotplug. You can also define the topology manually',
          )}
        >
          <Button
            aria-label="Action"
            className="cpu-input__title--help-text-button"
            variant={ButtonVariant.plain}
          >
            <HelpIcon />
          </Button>
        </Popover>
      </Title>
      <Radio
        body={
          <VCPUInput
            cpu={formatVCPUsAsSockets(userEnteredCPU)}
            isDisabled={selectedRadioOption !== CPUInputType.editVCPU}
            setCPU={setUserEnteredCPU}
          />
        }
        onClick={() => {
          setSelectedRadioOption(CPUInputType.editVCPU);
        }}
        id={CPUInputType.editVCPU}
        isChecked={selectedRadioOption === CPUInputType.editVCPU}
        isLabelWrapped
        name={radioInputName}
      />
      <CPUHelperText
        cpu={userEnteredCPU}
        hide={userEnteredCPU?.sockets === convertTopologyToVCPUs(currentCPU)}
      />
      <Radio
        body={
          <CPUTopologyInput
            cpu={userEnteredCPU}
            hide={selectedRadioOption !== CPUInputType.editTopologyManually}
            isDisabled={selectedRadioOption !== CPUInputType.editTopologyManually}
            setCPU={setUserEnteredCPU}
          />
        }
        onClick={() => {
          setSelectedRadioOption(CPUInputType.editTopologyManually);
        }}
        className="cpu-input__edit-topology-manually"
        id={CPUInputType.editTopologyManually}
        isChecked={selectedRadioOption === CPUInputType.editTopologyManually}
        label={<>{t('Set CPU topology manually')}</>}
        name={radioInputName}
      />
    </div>
  );
};

export default CPUInput;
