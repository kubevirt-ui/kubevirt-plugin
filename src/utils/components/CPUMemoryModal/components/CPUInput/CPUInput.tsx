import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import { V1CPU, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VCPUInput from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/components/vCPUInput/VCPUInput';
import {
  convertTopologyToVCPUs,
  CPUInputType,
  formatVCPUsAsSockets,
} from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { Button, ButtonVariant, Popover, Radio, Title, TitleSizes } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import CPUTopologyInput from './components/CPUTopologyInput/CPUTopologyInput';
import CPUHelperText from './components/vCPUInput/components/CPUHelperText/CPUHelperText';

import './CPUInput.scss';

type CPUInputProps = {
  setCPU: Dispatch<SetStateAction<V1CPU>>;
  vm: V1VirtualMachine;
};

const CPUInput: FC<CPUInputProps> = ({ setCPU, vm }) => {
  const { t } = useKubevirtTranslation();
  const [selectedRadioOption, setSelectedRadioOption] = useState<CPUInputType>(
    CPUInputType.editVCPU,
  );

  const [socketsEditedVCPU, setSocketsEditedVCPU] = useState<V1CPU>(
    formatVCPUsAsSockets(getCPU(vm)),
  );
  const [topologyEditedVCPU, setTopologyEditedVCPU] = useState<V1CPU>(getCPU(vm));

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
            cpu={socketsEditedVCPU}
            setCPU={setSocketsEditedVCPU}
            setSelectedRadioOption={setSelectedRadioOption}
          />
        }
        onClick={() => {
          setSelectedRadioOption(CPUInputType.editVCPU);
          setCPU(socketsEditedVCPU);
        }}
        id={CPUInputType.editVCPU}
        isChecked={selectedRadioOption === CPUInputType.editVCPU}
        isLabelWrapped
        name={radioInputName}
      />
      <CPUHelperText
        hide={socketsEditedVCPU?.sockets === convertTopologyToVCPUs(getCPU(vm))}
        sockets={socketsEditedVCPU?.sockets}
      />
      <Radio
        body={
          <CPUTopologyInput
            cpu={topologyEditedVCPU}
            hide={selectedRadioOption !== CPUInputType.editTopologyManually}
            setCPU={setTopologyEditedVCPU}
          />
        }
        onClick={() => {
          setSelectedRadioOption(CPUInputType.editTopologyManually);
          setCPU(topologyEditedVCPU);
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
