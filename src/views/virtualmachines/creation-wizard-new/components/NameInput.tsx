import React, { FC, FormEvent, useCallback } from 'react';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useNameValidation } from '@kubevirt-utils/hooks/useNameValidation';
import {
  getDNS1123LabelError,
  getDNS1123LabelErrorLenient,
} from '@kubevirt-utils/utils/validation';
import { InputGroup, InputGroupItem, TextInput } from '@patternfly/react-core';

import useVMWizardStore from '../state/vm-wizard-store/useVMWizardStore';

import GenerateVMNameButton from './GenerateVMNameButton';

const NameInput: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setShouldCheckVMNameProperly, setVMName, shouldCheckVMNameProperly, vmName } =
    useVMWizardStore();
  const getError = shouldCheckVMNameProperly ? getDNS1123LabelError : getDNS1123LabelErrorLenient;
  const { errorText, validated } = useNameValidation({ getError, name: vmName });

  const applyName = useCallback(
    (newName: string) => {
      setShouldCheckVMNameProperly(false);
      setVMName(newName);
    },
    [setVMName, setShouldCheckVMNameProperly],
  );

  const onNameChange = (_event: FormEvent<HTMLInputElement>, name: string) => {
    applyName(name);
  };

  return (
    <>
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            id="vm-name"
            onChange={onNameChange}
            placeholder={t('Enter a name or click the refresh icon to generate one')}
            type="text"
            validated={validated}
            value={vmName}
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
