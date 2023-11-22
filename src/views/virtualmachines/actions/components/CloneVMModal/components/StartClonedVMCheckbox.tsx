import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';

type StartClonedVMCheckboxProps = {
  setStartCloneVM: React.Dispatch<React.SetStateAction<boolean>>;
  startCloneVM: boolean;
};

const StartClonedVMCheckbox: React.FC<StartClonedVMCheckboxProps> = ({
  setStartCloneVM,
  startCloneVM,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup fieldId="start-clone" hasNoPaddingTop label={t('Start cloned VM')}>
      <Checkbox
        id="start-clone"
        isChecked={startCloneVM}
        label={t('Start VirtualMachine on clone')}
        onChange={setStartCloneVM}
      />
    </FormGroup>
  );
};

export default StartClonedVMCheckbox;
