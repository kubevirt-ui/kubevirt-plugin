import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form } from '@patternfly/react-core';

import { buildFields, getVirtualMachineNameField } from '../../utils';
import { ExpandableOptionsFields } from '../ExpandableOptionalFields';
import { FieldGroup } from '../FieldGroup';
import { FormActionGroup } from '../FormActionGroup';
import { FormError } from '../FormError';

import { useCustomizeFormSubmit } from './useCustomizeFormSubmit';

type CustomizeFormProps = {
  template: V1Template;
};

export const CustomizeForm: React.FC<CustomizeFormProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const methods = useForm();

  const { onSubmit, loaded, error } = useCustomizeFormSubmit({ template });
  const [requiredFields, optionalFields] = buildFields(template);
  const nameField = getVirtualMachineNameField(template, t);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <FieldGroup field={nameField} showError={error} />
        {requiredFields?.map((field) => (
          <FieldGroup key={field.name} field={field} showError={error} />
        ))}

        <ExpandableOptionsFields optionalFields={optionalFields} />

        <FormError error={error} />
        <FormActionGroup loading={!loaded} />
      </Form>
    </FormProvider>
  );
};
