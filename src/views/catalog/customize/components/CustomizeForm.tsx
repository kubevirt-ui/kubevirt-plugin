import * as React from 'react';
import { useParams } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ActionGroup, Button, ExpandableSection, Form } from '@patternfly/react-core';

import {
  buildFields,
  createVirtualMachine,
  extractParameterNameFromMetadataName,
  isFieldInvalid,
} from '../utils';

import { FieldGroup } from './FieldGroup';

type CustomizeFormProps = {
  template: V1Template;
};

export const CustomizeForm: React.FC<CustomizeFormProps> = ({ template }) => {
  const { ns } = useParams<{ ns: string }>();

  const { t } = useKubevirtTranslation();
  const [optionalFieldsExpanded, setOptionalFieldsExpanded] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [validationError, setValidationError] = React.useState(false);

  const parameterForName = extractParameterNameFromMetadataName(template);

  const [requiredFields, optionalFields] = buildFields(template, [parameterForName], t);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);

      const requiredFieldNoValue = requiredFields.find((field) => isFieldInvalid(field, formData));
      if (requiredFieldNoValue) return setValidationError(true);

      await createVirtualMachine(template, ns, parameterForName, formData);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <Form onSubmit={onSubmit}>
      {requiredFields?.map((field) => (
        <FieldGroup key={field.name} field={field} showError={validationError} />
      ))}

      {optionalFields && optionalFields.length > 0 && (
        <ExpandableSection
          toggleText={t('Optional parameters')}
          data-test-id="expandable-section"
          onToggle={() => setOptionalFieldsExpanded(!optionalFieldsExpanded)}
          isExpanded={optionalFieldsExpanded}
        >
          {optionalFields?.map((field) => (
            <FieldGroup key={field.name} field={field} />
          ))}
        </ExpandableSection>
      )}

      <div className="customize-vm__footer">
        <ActionGroup>
          <Button
            variant="primary"
            type="submit"
            isLoading={loading}
            data-test-id="customize-vm-submit-button"
          >
            {t('Review and create Virtual Machine')}
          </Button>
          <Button variant="link">{t('Cancel')}</Button>
        </ActionGroup>
      </div>
    </Form>
  );
};
