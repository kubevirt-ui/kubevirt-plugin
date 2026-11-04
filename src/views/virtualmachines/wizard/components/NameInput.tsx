import React, { type FC, useCallback } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useNameValidation } from '@kubevirt-utils/hooks/useNameValidation';
import {
  getVMNameError,
  getVMNameErrorLenient,
} from '@kubevirt-utils/utils/dns1123SubdomainValidation';
import { InputGroup, InputGroupItem, TextInput } from '@patternfly/react-core';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '../state/vm-wizard-form/consts';
import GenerateVMNameButton from './GenerateVMNameButton';

const NameInput: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, setValue } = useVMWizard();
  const vmName = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.NAME });
  const shouldCheckVMNameProperly = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_UI_STATE.SHOULD_CHECK_VM_NAME_PROPERLY,
  });
  const getError = shouldCheckVMNameProperly ? getVMNameError : getVMNameErrorLenient;
  const { errorText, validated } = useNameValidation({ getError, name: vmName });

  const applyName = useCallback(
    (newName: string) => {
      setValue(CREATE_VM_FORM_FIELDS_UI_STATE.SHOULD_CHECK_VM_NAME_PROPERLY, false);
      setValue(CREATE_VM_FORM_FIELDS_VM_DATA.NAME, newName);
    },
    [setValue],
  );

  return (
    <>
      <InputGroup>
        <InputGroupItem isFill>
          <Controller
            control={control}
            name={CREATE_VM_FORM_FIELDS_VM_DATA.NAME}
            render={({ field }) => (
              <TextInput
                id="vm-name"
                name={field.name}
                onBlur={field.onBlur}
                onChange={(_event, value) => applyName(value)}
                placeholder={t('Enter a name or click the refresh icon to generate one')}
                type="text"
                validated={validated}
                value={typeof field.value === 'string' ? field.value : ''}
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
