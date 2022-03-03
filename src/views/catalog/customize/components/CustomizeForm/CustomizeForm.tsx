import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ActionGroup, Button, ExpandableSection, Form } from '@patternfly/react-core';

import { getTemplateVirtualMachineObject } from '../../../utils/templateGetters';
import { useWizardVMContext } from '../../../utils/WizardVMContext';
import { formValidation, processTemplate } from '../../utils';
import { FieldGroup } from '../FieldGroup';

import { CustomizeFormActions } from './actions';
import customizeFormReducer, { initializeReducer } from './reducer';

type CustomizeFormProps = {
  template: V1Template;
};

export const CustomizeForm: React.FC<CustomizeFormProps> = ({ template }) => {
  const { ns } = useParams<{ ns: string }>();
  const history = useHistory();
  const { updateVM } = useWizardVMContext();
  const { t } = useKubevirtTranslation();
  const [optionalFieldsExpanded, setOptionalFieldsExpanded] = React.useState(true);

  const [state, dispatch] = React.useReducer(customizeFormReducer, null, () =>
    initializeReducer(template, t),
  );

  const { parametersErrors, loading, requiredFields, optionalFields } = state;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    dispatch({ type: CustomizeFormActions.Loading });

    try {
      const formData = new FormData(event.currentTarget as HTMLFormElement);

      const errors = formValidation(t, formData, requiredFields);

      if (errors) {
        dispatch({ type: CustomizeFormActions.FormError, payload: errors });
      } else {
        const processedTemplate = await processTemplate(template, ns, formData);
        dispatch({ type: CustomizeFormActions.Success });
        const vm = getTemplateVirtualMachineObject(processedTemplate);
        vm.metadata.namespace = ns;
        updateVM(vm);
        history.push(
          `/k8s/ns/${ns || 'default'}/templatescatalog/review?name=${
            template.metadata.name
          }&namespace=${template.metadata.namespace}`,
        );
      }
    } catch (error) {
      dispatch({ type: CustomizeFormActions.ApiError, payload: error.message });
      console.error(error);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      {requiredFields?.map((field) => (
        <FieldGroup key={field.name} field={field} error={parametersErrors?.[field.name]} />
      ))}
      {optionalFields && optionalFields.length > 0 && (
        <ExpandableSection
          toggleText={t('Optional parameters')}
          data-test-id="expandable-optional-section"
          onToggle={() => setOptionalFieldsExpanded(!optionalFieldsExpanded)}
          isExpanded={optionalFieldsExpanded}
        >
          {optionalFields?.map((field) => (
            <FieldGroup key={field.name} field={field} />
          ))}
        </ExpandableSection>
      )}

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
    </Form>
  );
};
