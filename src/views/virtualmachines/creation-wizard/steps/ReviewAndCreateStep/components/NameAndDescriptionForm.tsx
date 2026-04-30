import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import TabToConfirmTextInput from '@kubevirt-utils/components/TabToConfirmTextInput/TabToConfirmTextInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDescription, getName } from '@kubevirt-utils/resources/shared';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { getDNS1123LabelError } from '@kubevirt-utils/utils/validation';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';
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
    setIsVMNameValid,
    setVMNameInteracted,
    vmNameInteracted,
  } = useVMWizardStore();
  const isCloneMethod = isCloneCreationMethod(creationMethod);

  useSignals();
  const vm = vmSignal.value;

  const handleSetIsValid = (valid: boolean) => {
    setIsVMNameValid(valid);
    if (!vmNameInteracted) setVMNameInteracted(true);
  };

  const onNameChange = (name: string) => {
    if (isCloneMethod) setCloneVMName(name);
    else updateCustomizeInstanceType([{ data: name, path: 'metadata.name' }]);
  };

  const onDescriptionChange = (description: string) => {
    if (isCloneMethod) setCloneVMDescription(description);
    else
      updateCustomizeInstanceType([
        { data: description, path: 'metadata.annotations.description' },
      ]);
  };

  return (
    <Form>
      <TabToConfirmTextInput
        helperText={
          <Trans t={t}>
            Press the <strong>Tab</strong> key to accept the suggestion or enter a custom name.
          </Trans>
        }
        autoFocus
        className="name-and-description-form__input"
        defaultInteracted={vmNameInteracted}
        fieldId="vm name"
        isRequired
        label={t('Name')}
        onChange={onNameChange}
        setIsValid={handleSetIsValid}
        validator={getDNS1123LabelError}
        value={isCloneMethod ? cloneVMName : getName(vm)}
      />
      <FormGroup className="name-and-description-form__input" label={t('Description')}>
        <TextInput
          onChange={(_event, value: string) => onDescriptionChange(value)}
          type="text"
          value={isCloneMethod ? cloneVMDescription : getDescription(vm)}
        />
      </FormGroup>
    </Form>
  );
};

export default NameAndDescriptionForm;
