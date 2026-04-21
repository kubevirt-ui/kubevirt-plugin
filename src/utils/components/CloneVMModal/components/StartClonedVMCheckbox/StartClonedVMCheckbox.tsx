import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import './StartClonedVMCheckbox.scss';

type StartClonedVMCheckboxProps = {
  setStartCloneVM: Dispatch<SetStateAction<boolean>>;
  startCloneVM: boolean;
};

const StartClonedVMCheckbox: FC<StartClonedVMCheckboxProps> = ({
  setStartCloneVM,
  startCloneVM,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup className="StartClonedVMCheckbox" fieldId="start-clone">
      <Checkbox
        id="start-clone"
        isChecked={startCloneVM}
        label={t('Start VirtualMachine once created')}
        onChange={(_, checked: boolean) => setStartCloneVM(checked)}
      />
    </FormGroup>
  );
};

export default StartClonedVMCheckbox;
