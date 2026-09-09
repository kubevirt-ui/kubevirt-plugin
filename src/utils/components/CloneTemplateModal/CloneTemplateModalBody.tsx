import React, { type FC, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type Template } from '@kubevirt-utils/resources/template';
import { FormGroup } from '@patternfly/react-core';

import FormGroupHelperText from '../FormGroupHelperText/FormGroupHelperText';
import CloneStorageCheckbox from './CloneStorageCheckbox';
import FormGroupTextInput from './components/FormGroupTextInput';
import { SOURCE_TEMPLATE_TOGGLE_TEST_ID } from './constants';
import { CloneTemplateField, type CloneTemplateFormValues } from './form/types';
import SelectProject from './SelectProject';
import SelectTemplate from './SelectTemplate';
import { getTemplateBootSourcePVC } from './utils';

type CloneTemplateModalBodyProps = {
  initialTemplate?: V1Template;
  onTemplateSelected: (template: Template) => void;
};

const CloneTemplateModalBody: FC<CloneTemplateModalBodyProps> = ({
  initialTemplate,
  onTemplateSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const { control, setValue, watch } = useFormContext<CloneTemplateFormValues>();
  const sourceProject = watch(CloneTemplateField.SourceProject);
  const isCloneStorageEnabled = watch(CloneTemplateField.IsCloneStorageEnabled);
  const template = watch(CloneTemplateField.Template);
  const hasClonableStorage = !!getTemplateBootSourcePVC(template);

  useEffect(() => {
    if (!hasClonableStorage && isCloneStorageEnabled) {
      setValue(CloneTemplateField.IsCloneStorageEnabled, false);
    }
  }, [hasClonableStorage, isCloneStorageEnabled, setValue]);

  return (
    <>
      {!initialTemplate && (
        <FormGroup isRequired label={t('Source template project')}>
          <Controller
            render={({ field: { onChange, value } }) => (
              <SelectProject selectedProject={value} setSelectedProject={onChange} />
            )}
            control={control}
            name={CloneTemplateField.SourceProject}
          />
        </FormGroup>
      )}
      <FormGroup isRequired label={t('Source template')}>
        <SelectTemplate
          dataTestId={SOURCE_TEMPLATE_TOGGLE_TEST_ID}
          isDisabled={!!initialTemplate}
          namespace={sourceProject}
          onTemplateSelect={onTemplateSelected}
          selectedTemplate={template}
        />
      </FormGroup>
      <FormGroupTextInput
        fieldId={CloneTemplateField.TemplateName}
        isRequired
        label={t('New template name')}
      />
      <FormGroup isRequired label={t('Template project')}>
        <Controller
          render={({ field: { onChange, value } }) => (
            <SelectProject selectedProject={value} setSelectedProject={onChange} />
          )}
          control={control}
          name={CloneTemplateField.TargetProject}
        />
        <FormGroupHelperText>{t('Project name to clone the template to')}</FormGroupHelperText>
      </FormGroup>
      <FormGroupTextInput
        fieldId={CloneTemplateField.TemplateDisplayName}
        label={t('Template display name')}
      />
      <FormGroupTextInput
        fieldId={CloneTemplateField.TemplateProvider}
        label={t('Template provider')}
      >
        <FormGroupHelperText>{t('Example: your company name')}</FormGroupHelperText>
      </FormGroupTextInput>
      {hasClonableStorage && (
        <Controller
          render={({ field: { onChange, value } }) => (
            <CloneStorageCheckbox isChecked={value} onChange={onChange} />
          )}
          control={control}
          name={CloneTemplateField.IsCloneStorageEnabled}
        />
      )}
      {hasClonableStorage && isCloneStorageEnabled && (
        <FormGroupTextInput
          className="pvc-name-form-group"
          fieldId={CloneTemplateField.PvcName}
          isRequired
          label={t("Name of the new template's disk")}
        />
      )}
    </>
  );
};

export default CloneTemplateModalBody;
