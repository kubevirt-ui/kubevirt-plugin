import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Form } from '@patternfly/react-core';

import { buildFields, extractParameterNameFromMetadataName } from '../../utils';
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
  const [onSubmit, loaded, error] = useCustomizeFormSubmit(template);

  const parameterForName = extractParameterNameFromMetadataName(template);

  const [requiredFields, optionalFields] = buildFields(template, [parameterForName], t);

  return (
    <Form onSubmit={onSubmit}>
      {requiredFields?.map((field) => (
        <FieldGroup key={field.name} field={field} showError={error} />
      ))}

      <ExpandableOptionsFields optionalFields={optionalFields} />

      <FormError error={error} />
      <FormActionGroup loading={!loaded} />
    </Form>
  );
};
