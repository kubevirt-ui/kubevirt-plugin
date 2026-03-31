import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDescription, getName } from '@kubevirt-utils/resources/shared';
import { FormGroup, Stack, StackItem, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { updateWizardVM } from '@virtualmachines/creation-wizard/state/vm-signal/utils';
import { wizardVMSignal } from '@virtualmachines/creation-wizard/state/vm-signal/vmStore';

import metadata from '../../../../../../../plugin-metadata';

import './NameAndDescriptionForm.scss';

const NameAndDescriptionForm: FC = () => {
  const { t } = useKubevirtTranslation();
  const [nameValidated, setNameValidated] = useState<ValidatedOptions>(ValidatedOptions.default);
  const [descriptionValidated, setDescriptionValidated] = useState<ValidatedOptions>(
    ValidatedOptions.default,
  );
  useSignals();
  const vm = wizardVMSignal.value;

  const onNameChange = (name: string) => {
    updateWizardVM([{ data: name, path: metadata.name }]);
    setNameValidated(ValidatedOptions.success);
  };

  const onDescriptionChange = (description: string) => {
    updateWizardVM([{ data: description, path: metadata.description }]);
    setDescriptionValidated(ValidatedOptions.success);
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <FormGroup className="name-and-description-form__input" label={t('Name')}>
          <TextInput
            onChange={(_event, value: string) => onNameChange(value)}
            type="text"
            validated={nameValidated}
            value={getName(vm)}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup className="name-and-description-form__input" label={t('Description')}>
          <TextInput
            onChange={(_event, value: string) => onDescriptionChange(value)}
            type="text"
            validated={descriptionValidated}
            value={getDescription(vm)}
          />
        </FormGroup>
      </StackItem>
    </Stack>
  );
};

export default NameAndDescriptionForm;
