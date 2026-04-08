import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDescription, getName } from '@kubevirt-utils/resources/shared';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { FormGroup, Stack, StackItem, TextInput, ValidatedOptions } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard/utils/utils';

import './NameAndDescriptionForm.scss';

const NameAndDescriptionForm: FC = () => {
  const { t } = useKubevirtTranslation();
  const { cloneVMDescription, cloneVMName, creationMethod, setCloneVMDescription, setCloneVMName } =
    useVMWizardStore();
  const isCloneMethod = isCloneCreationMethod(creationMethod);

  const [nameValidated, setNameValidated] = useState<ValidatedOptions>(ValidatedOptions.default);
  const [descriptionValidated, setDescriptionValidated] = useState<ValidatedOptions>(
    ValidatedOptions.default,
  );
  useSignals();
  const vm = vmSignal.value;

  const onNameChange = (name: string) => {
    if (isCloneMethod) setCloneVMName(name);
    else updateCustomizeInstanceType([{ data: name, path: 'metadata.name' }]);

    setNameValidated(ValidatedOptions.success);
  };

  const onDescriptionChange = (description: string) => {
    if (isCloneMethod) setCloneVMDescription(description);
    else
      updateCustomizeInstanceType([
        { data: description, path: 'metadata.annotations.description' },
      ]);

    setDescriptionValidated(ValidatedOptions.success);
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <FormGroup className="name-and-description-form__input" label={t('Name')}>
          <TextInput
            autoFocus
            onChange={(_event, value: string) => onNameChange(value)}
            type="text"
            validated={nameValidated}
            value={isCloneMethod ? cloneVMName : getName(vm)}
          />
        </FormGroup>
      </StackItem>
      <StackItem>
        <FormGroup className="name-and-description-form__input" label={t('Description')}>
          <TextInput
            onChange={(_event, value: string) => onDescriptionChange(value)}
            type="text"
            validated={descriptionValidated}
            value={isCloneMethod ? cloneVMDescription : getDescription(vm)}
          />
        </FormGroup>
      </StackItem>
    </Stack>
  );
};

export default NameAndDescriptionForm;
