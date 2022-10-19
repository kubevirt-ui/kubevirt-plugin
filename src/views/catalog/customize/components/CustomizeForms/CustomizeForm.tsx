import React, { FC, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { Form } from '@patternfly/react-core';

import { buildFields, getVirtualMachineNameField } from '../../utils';
import { ExpandableOptionsFields } from '../ExpandableOptionalFields';
import { FieldGroup } from '../FieldGroup';
import { FormActionGroup } from '../FormActionGroup';
import { FormError } from '../FormError';

import { useCustomizeFormSubmit } from './useCustomizeFormSubmit';

type CustomizeFormProps = {
  template: V1Template;
  isBootSourceAvailable?: boolean;
};

export const CustomizeForm: FC<CustomizeFormProps> = ({ template }) => {
  const methods = useForm();

  const { onSubmit, loaded, error } = useCustomizeFormSubmit({ template });
  const [requiredFields, optionalFields] = buildFields(template);

  const { vmName } = useParams<{ vmName?: string }>();

  const nameField = useMemo(() => getVirtualMachineNameField(vmName), [vmName]);

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
