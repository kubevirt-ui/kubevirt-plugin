import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';

type StartClonedVMCheckboxProps = {
  startCloneVM: boolean;
  setStartCloneVM: React.Dispatch<React.SetStateAction<boolean>>;
};

const StartClonedVMCheckbox: React.FC<StartClonedVMCheckboxProps> = ({
  startCloneVM,
  setStartCloneVM,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup hasNoPaddingTop label={t('Start cloned VM')} fieldId="start-clone">
      <Checkbox
        id="start-clone"
        label={t('Start VirtualMachine on clone')}
        isChecked={startCloneVM}
        onChange={setStartCloneVM}
      />
    </FormGroup>
  );
};

export default StartClonedVMCheckbox;
