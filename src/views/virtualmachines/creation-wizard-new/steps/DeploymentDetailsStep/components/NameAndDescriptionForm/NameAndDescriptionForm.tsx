import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form, FormGroup } from '@patternfly/react-core';
import DescriptionInput from '@virtualmachines/creation-wizard-new/components/DescriptionInput';
import NameInput from '@virtualmachines/creation-wizard-new/components/NameInput';

import './NameAndDescriptionForm.scss';

const NameAndDescriptionForm: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Form className="name-and-description-form">
      <FormGroup fieldId="vm-name" isRequired label={t('Name')}>
        <NameInput />
      </FormGroup>
      <FormGroup fieldId="vm-description" label={t('Description')}>
        <DescriptionInput />
      </FormGroup>
    </Form>
  );
};

export default NameAndDescriptionForm;
