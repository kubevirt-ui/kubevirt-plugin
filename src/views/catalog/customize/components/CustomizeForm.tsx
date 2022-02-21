import * as React from 'react';
import { useParams } from 'react-router-dom';

import {
  ProcessedTemplatesModel,
  TemplateParameter,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import {
  ActionGroup,
  Button,
  ExpandableSection,
  Form,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';

import { DEFAULT_NAMESPACE, VIRTUAL_MACHINE_KIND } from '../constants';

type FieldGroupProps = {
  field: TemplateParameter;
  showError?: boolean;
};

const FieldGroup: React.FC<FieldGroupProps> = ({ field, showError }) => {
  const { t } = useKubevirtTranslation();
  const { name, description, displayName, required, value: initialValue } = field;
  const [value, setValue] = React.useState(initialValue || '');

  const validated = showError && !value ? 'error' : 'default';

  return (
    <FormGroup
      label={displayName}
      fieldId={`customize-required-${name}`}
      isRequired={required}
      helperText={description}
      helperTextInvalid={t('This field is required')}
      helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
      validated={validated}
    >
      <TextInput
        isRequired={required}
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={(newValue) => setValue(newValue)}
        validated={validated}
      />
    </FormGroup>
  );
};

type CustomizeFormProps = {
  template: V1Template;
};

const isFieldInvalid = (field: TemplateParameter, formData: FormData) =>
  (formData.get(field.name) as string).length === 0;

export const CustomizeForm: React.FC<CustomizeFormProps> = ({ template }) => {
  const { ns } = useParams<{ ns: string }>();

  const { t } = useKubevirtTranslation();
  const [optionalFieldsExpanded, setOptionalFieldsExpanded] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [validationError, setValidationError] = React.useState(false);

  const optionalFields = template.parameters?.filter((parameter) => !parameter.required);
  const requiredFields = template.parameters?.filter((parameter) => parameter.required);

  const createVirtualMachine = async (formData: FormData) => {
    template.parameters.forEach((parameter) => {
      const formParameter = formData.get(parameter.name) as string;

      if (formParameter.length > 0) parameter.value = formParameter;
    });

    const virtualMachineObject = template.objects.find(
      (object) => object.kind === VIRTUAL_MACHINE_KIND,
    );

    virtualMachineObject.name = formData.get('NAME');
    virtualMachineObject.namespace = ns || DEFAULT_NAMESPACE;

    const processedTemplate = await k8sCreate<V1Template>({
      model: ProcessedTemplatesModel,
      data: template,
      queryParams: {
        dryRun: 'All',
      },
    });

    return processedTemplate;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);

      const requiredFieldNoValue = requiredFields.find((field) => isFieldInvalid(field, formData));
      if (requiredFieldNoValue) return setValidationError(true);

      await createVirtualMachine(formData);
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
