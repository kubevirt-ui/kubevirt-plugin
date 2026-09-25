import { type FC, useEffect, useMemo, useState } from 'react';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { yupResolver } from '@hookform/resolvers/yup';
import { type TemplateParameter } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getParameters, replaceTemplateParameters } from '@kubevirt-utils/resources/template';
import { Button, ButtonVariant, Form, Stack, StackItem } from '@patternfly/react-core';
import { createTemplateParametersSchema } from '@virtualmachines/wizard/form/schema/template/createTemplateSchema';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import { NAME_INPUT_FIELD } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/utils/consts';
import { useDrawerContext } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/hooks/useDrawerContext';

import FieldGroup from './FieldGroup';

type ParameterDraftValues = { parameters: TemplateParameter[] };

type ParametersSectionProps = {
  onCommit: () => void;
  showValidation?: boolean;
};

const ParametersSections: FC<ParametersSectionProps> = ({ onCommit, showValidation = false }) => {
  const { t } = useKubevirtTranslation();
  const { setTemplate, template: drawerTemplate } = useDrawerContext();
  const { setValue: setTargetValue } = useVMWizardForm();
  const { invalidateTemplateGeneration } = useVMWizardState();

  const draftParameters = useMemo(() => getParameters(drawerTemplate) ?? [], [drawerTemplate]);

  const schema = useMemo(
    () =>
      yup.object({
        parameters: createTemplateParametersSchema(t),
      }),
    [t],
  );

  const {
    control,
    formState: { isSubmitting, isValid },
    handleSubmit,
    trigger,
  } = useForm<ParameterDraftValues>({
    mode: 'onChange',
    resolver: yupResolver(schema) as Resolver<ParameterDraftValues>,
    values: { parameters: draftParameters },
  });
  const [isEdit, setIsEdit] = useState<boolean>(showValidation);
  const startEditing = (): void => {
    setIsEdit(true);
    void trigger();
  };

  useEffect(() => {
    if (showValidation) {
      setIsEdit(true);
      void trigger();
    }
  }, [showValidation, trigger]);

  const commitDraft = handleSubmit(({ parameters: submittedParameters }) => {
    const committedTemplate = replaceTemplateParameters(drawerTemplate, submittedParameters);

    setTemplate(committedTemplate);
    invalidateTemplateGeneration();
    setTargetValue('template.selectedTemplate', committedTemplate, {
      shouldValidate: true,
    });
    onCommit();
    setIsEdit(false);
  });

  return (
    <Form className="pf-v6-u-mt-lg">
      <Stack hasGutter>
        <StackItem>
          {draftParameters.map((parameter, index) => {
            if (!parameter.required || parameter.name === NAME_INPUT_FIELD) return null;

            return (
              <Controller
                control={control}
                key={parameter.name}
                name={`parameters.${index}.value`}
                render={({ field, fieldState }) => (
                  <FieldGroup
                    errorMessage={fieldState.error?.message}
                    field={{ ...parameter, value: field.value ?? '' }}
                    isDisabled={!isEdit}
                    onChange={(_name, value) => field.onChange(value)}
                  />
                )}
              />
            );
          })}
        </StackItem>
        <StackItem isFilled />
        <StackItem>
          <Button
            data-test="edit-parameters-button"
            isDisabled={isSubmitting || (isEdit && !isValid)}
            onClick={isEdit ? commitDraft : startEditing}
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
