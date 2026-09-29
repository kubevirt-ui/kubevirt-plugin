import { type FC, useCallback } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useNameValidation } from '@kubevirt-utils/hooks/useNameValidation';
import {
  getDNS1123LabelError,
  getDNS1123LabelErrorLenient,
} from '@kubevirt-utils/utils/validation';
import { InputGroup, InputGroupItem, TextInput } from '@patternfly/react-core';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';
import GenerateVMNameButton from './GenerateVMNameButton';

const NameInput: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, setValue } = useVMWizard();
  const vmName = useWatch({ control, name: 'deployment.name' });
  const shouldCheckVMNameProperly = useWatch({
    control,
    name: 'navigation.strictVMName',
  });
  const getError = shouldCheckVMNameProperly ? getDNS1123LabelError : getDNS1123LabelErrorLenient;
  const { errorText, validated } = useNameValidation({ getError, name: vmName });

  const applyName = useCallback(
    (newName: string) => {
      setValue('navigation.strictVMName', false);
      setValue('deployment.name', newName);
    },
    [setValue],
  );

  return (
    <>
      <InputGroup>
        <InputGroupItem isFill>
          <Controller
            control={control}
            name="deployment.name"
            render={({ field: { ref: _ref, ...field } }) => (
              <TextInput
                id="vm-name"
                {...field}
                onChange={(_event, value) => applyName(value)}
                placeholder={t('Enter a name or click the refresh icon to generate one')}
                type="text"
                validated={validated}
              />
            )}
          />
        </InputGroupItem>
        <InputGroupItem>
          <GenerateVMNameButton applyName={applyName} />
        </InputGroupItem>
      </InputGroup>
      {errorText && <FormGroupHelperText validated={validated}>{errorText}</FormGroupHelperText>}
    </>
  );
};

export default NameInput;
