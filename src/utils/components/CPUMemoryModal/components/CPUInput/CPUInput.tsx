import React, { type Dispatch, type FC, type SetStateAction, useState } from 'react';

import { type V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import VCPUInput from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/components/vCPUInput/VCPUInput';
import {
  CPUInputType,
  getInitialCPUInputType,
} from '@kubevirt-utils/components/CPUMemoryModal/components/CPUInput/utils/utils';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Flex, Radio, Title, TitleSizes } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import CPUTopologyInput from './components/CPUTopologyInput/CPUTopologyInput';
import CPUHelperText from './components/vCPUInput/components/CPUHelperText/CPUHelperText';
import { DEFAULT_CPU } from './constants';

import './CPUInput.scss';

type CPUInputProps = {
  cpuLimits: Record<string, number>;
  currentCPU: undefined | V1CPU;
  setUserEnteredCPU: Dispatch<SetStateAction<undefined | V1CPU>>;
  userEnteredCPU: undefined | V1CPU;
};

const CPUInput: FC<CPUInputProps> = ({
  cpuLimits,
  currentCPU,
  setUserEnteredCPU,
  userEnteredCPU,
}) => {
  const { t } = useKubevirtTranslation();
  const [selectedRadioOption, setSelectedRadioOption] = useState<CPUInputType>(() =>
    getInitialCPUInputType(userEnteredCPU),
  );

  // Disable vCPU mode for complex topologies (cores > 1 or threads > 1)
  const isComplexTopology = (userEnteredCPU?.cores ?? 1) > 1 || (userEnteredCPU?.threads ?? 1) > 1;

  const radioInputName = 'cpu-input-type';

  return (
    <div className="cpu-input">
      <Title className="cpu-input__title" headingLevel="h6" size={TitleSizes.md}>
        {t('CPU')}
        <HelpTextIcon
          bodyContent={t(
            'As a default, the VirtualMachine CPU uses sockets to enable hotplug. You can also define the topology manually',
          )}
          helpIconClassName="pf-v6-u-ml-sm"
        />
      </Title>
      {userEnteredCPU ? (
        <>
          <Flex alignItems={{ default: 'alignItemsCenter' }}>
            <Radio
              id={CPUInputType.editVCPU}
              isChecked={selectedRadioOption === CPUInputType.editVCPU}
              isDisabled={isComplexTopology}
              isLabelWrapped
              label={t('vCPU')}
              name={radioInputName}
              onClick={() => {
                if (!isComplexTopology) {
                  setSelectedRadioOption(CPUInputType.editVCPU);
                }
              }}
            />
            <VCPUInput
              cpu={userEnteredCPU}
              isDisabled={selectedRadioOption !== CPUInputType.editVCPU || isComplexTopology}
              setCPU={setUserEnteredCPU}
            />
          </Flex>
          <CPUHelperText
            cpu={userEnteredCPU}
            hide={userEnteredCPU.sockets === currentCPU?.sockets}
          />
          <Radio
            body={
              <CPUTopologyInput
                cpu={userEnteredCPU}
                cpuLimits={cpuLimits}
                hide={selectedRadioOption !== CPUInputType.editTopologyManually}
                isDisabled={selectedRadioOption !== CPUInputType.editTopologyManually}
                setCPU={setUserEnteredCPU}
              />
            }
            className="cpu-input__edit-topology-manually"
            id={CPUInputType.editTopologyManually}
            isChecked={selectedRadioOption === CPUInputType.editTopologyManually}
            label={t('Set CPU topology manually')}
            name={radioInputName}
            onClick={() => {
              setSelectedRadioOption(CPUInputType.editTopologyManually);
            }}
          />
        </>
      ) : (
        <Button
          icon={<PlusCircleIcon />}
          onClick={() => {
            setUserEnteredCPU(DEFAULT_CPU);
          }}
          variant={ButtonVariant.link}
        >
          {t('Add CPU')}
        </Button>
      )}
    </div>
  );
};

export default CPUInput;
