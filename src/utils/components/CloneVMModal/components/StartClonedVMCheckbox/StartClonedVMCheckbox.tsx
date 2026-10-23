import React, { Dispatch, FC, SetStateAction } from 'react';

import {
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getEffectiveRunStrategy } from '@kubevirt-utils/resources/vm';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import RerunOnFailureCloneWarning from './components/RerunOnFailureCloneWarning';

import './StartClonedVMCheckbox.scss';

type StartClonedVMCheckboxProps = {
  setStartCloneVM: Dispatch<SetStateAction<boolean>>;
  source?: V1beta1VirtualMachineSnapshot | V1VirtualMachine;
  startCloneVM: boolean;
};

const StartClonedVMCheckbox: FC<StartClonedVMCheckboxProps> = ({
  setStartCloneVM,
  source,
  startCloneVM,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <FormGroup className="StartClonedVMCheckbox" fieldId="start-clone">
        <Checkbox
          id="start-clone"
          isChecked={startCloneVM}
          label={t('Start VirtualMachine once created')}
          onChange={(_, checked: boolean) => setStartCloneVM(checked)}
        />
        <RerunOnFailureCloneWarning
          runStrategy={isVM(source) ? getEffectiveRunStrategy(source) : undefined}
          startCloneVM={startCloneVM}
        />
      </FormGroup>
    </>
  );
};

export default StartClonedVMCheckbox;
