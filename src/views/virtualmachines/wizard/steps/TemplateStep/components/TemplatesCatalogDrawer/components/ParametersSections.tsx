import { produce } from 'immer';
import React, { type FC, useEffect, useState } from 'react';

import { type TemplateParameter } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Form, Stack, StackItem } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { useDrawerContext } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/hooks/useDrawerContext';
import {
  changeTemplateParameterValue,
  getPasswordParameterValueError,
  isSomeParametersHavValidationError,
} from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';

import FieldGroup from './FieldGroup';

type ParametersSectionProps = {
  requiredParameters: TemplateParameter[];
  showValidation?: boolean;
};

const ParametersSections: FC<ParametersSectionProps> = ({
  requiredParameters,
  showValidation = false,
}) => {
  const { t } = useKubevirtTranslation();
  const { setTemplate, template } = useDrawerContext();
  const { setValue } = useVMWizard();
  const [isEdit, setIsEdit] = useState<boolean>(showValidation);
  const [showPasswordValidationError, setShowPasswordValidationError] = useState<boolean>(false);

  useEffect(() => {
    if (showValidation) {
      setIsEdit(true);
    }
  }, [showValidation]);

  const onFieldValueChange = (parameter: TemplateParameter): void => {
    const { from, name, value } = parameter;
    const passwordError = getPasswordParameterValueError(t, value ?? '', from ?? '');
    setShowPasswordValidationError(Boolean(passwordError));

    const updatedTemplate = produce(template, (draft) => {
      changeTemplateParameterValue(draft, name, value ?? '');
    });

    setTemplate(updatedTemplate);
  };

  const onEditClick = (): void => {
    if (isEdit) {
      if (isSomeParametersHavValidationError(requiredParameters, t)) {
        return;
      }

      setValue(CREATE_VM_FORM_FIELDS_VM_DATA.SELECTED_TEMPLATE, template);
      setValue(CREATE_VM_FORM_FIELDS_UI_STATE.TEMPLATE_PROCESS_ERROR, null);
      setValue(CREATE_VM_FORM_FIELDS_UI_STATE.LAST_PROCESSED_TEMPLATE_KEY, '');
    }

    setIsEdit((prev) => !prev);
  };

  return (
    <Form className="pf-v6-u-mt-lg">
      <Stack hasGutter>
        <StackItem>
          {requiredParameters.map((param) => (
            <FieldGroup
              field={param}
              isDisabled={!isEdit}
              key={param.name}
              onChange={(name, value) => onFieldValueChange({ ...param, name, value })}
              showError={showValidation || showPasswordValidationError}
            />
          ))}
        </StackItem>
        <StackItem isFilled />
        <StackItem>
          <Button
            data-test="edit-parameters-button"
            isDisabled={showValidation || showPasswordValidationError}
            onClick={onEditClick}
            size="sm"
            variant={ButtonVariant.primary}
          >
            {isEdit ? t('Done') : t('Edit parameters')}
          </Button>
        </StackItem>
      </Stack>
    </Form>
  );
};

export default ParametersSections;
