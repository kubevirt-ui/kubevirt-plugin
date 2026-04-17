import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import TabToConfirmTextInput from '@kubevirt-utils/components/TabToConfirmTextInput/TabToConfirmTextInput';
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
  const {
    cloneVMDescription,
    cloneVMName,
    creationMethod,
    setCloneVMDescription,
    setCloneVMName,
    setVMNameConfirmed,
  } = useVMWizardStore();
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
        <TabToConfirmTextInput
          helperText={
            <Trans t={t}>
              Press the <strong>Tab</strong> key to accept the suggestion or enter a custom name.
            </Trans>
          }
          autoFocus
          className="name-and-description-form__input"
          fieldId="vm name"
          label={t('Name')}
          onChange={onNameChange}
          onConfirm={() => setVMNameConfirmed(true)}
          validated={nameValidated}
          value={isCloneMethod ? cloneVMName : getName(vm)}
        />
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
