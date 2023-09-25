import React, { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { Form } from '@patternfly/react-core';

import { buildFields } from '../../utils';
import { ExpandableOptionsFields } from '../ExpandableOptionalFields';
import { FieldGroup } from '../FieldGroup';
import { FormError } from '../FormError';

import { useCustomizeFormSubmit } from './useCustomizeFormSubmit';

type CustomizeFormProps = {
  isBootSourceAvailable?: boolean;
  template: V1Template;
};

export const CustomizeForm: FC<CustomizeFormProps> = ({ template }) => {
  const methods = useForm();

  const { error, onSubmit } = useCustomizeFormSubmit({ template });
  const [requiredFields, optionalFields] = buildFields(template);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        {requiredFields?.map((field) => (
          <FieldGroup field={field} key={field.name} showError={error} />
        ))}

        <ExpandableOptionsFields optionalFields={optionalFields} />

        <FormError error={error} />
      </Form>
    </FormProvider>
  );
};
