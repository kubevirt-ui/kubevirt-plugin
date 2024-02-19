import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';

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
    <FormGroup fieldId="start-clone" hasNoPaddingTop label={t('Start cloned VM')}>
      <Checkbox
        id="start-clone"
        isChecked={startCloneVM}
        label={t('Start VirtualMachine on clone')}
        onChange={(_, checked: boolean) => setStartCloneVM(checked)}
      />
    </FormGroup>
  );
};

export default StartClonedVMCheckbox;
