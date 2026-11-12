import { type FC } from 'react';
import { type Control, Controller } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import { type CloneVMModalFormValues } from '../../types/types';

import './StartClonedVMCheckbox.scss';

type StartClonedVMCheckboxProps = {
  control: Control<CloneVMModalFormValues>;
};

const StartClonedVMCheckbox: FC<StartClonedVMCheckboxProps> = ({ control }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup className="StartClonedVMCheckbox" fieldId="start-clone">
      <Controller
        control={control}
        name="startCloneVM"
        render={({ field: { onChange, value } }) => (
          <Checkbox
            id="start-clone"
            isChecked={value}
            label={t('Start VirtualMachine once created')}
            onChange={(_event, checked: boolean) => onChange(checked)}
          />
        )}
      />
    </FormGroup>
  );
};

export default StartClonedVMCheckbox;
