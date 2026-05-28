import React, { FC, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Template } from '@kubevirt-utils/resources/template';
import { FormGroup } from '@patternfly/react-core';

import FormGroupHelperText from '../FormGroupHelperText/FormGroupHelperText';

import FormGroupTextInput from './components/FormGroupTextInput';
import { CloneTemplateField, CloneTemplateFormValues } from './form/types';
import CloneStorageCheckbox from './CloneStorageCheckbox';
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
  const sourceProject = watch(CloneTemplateField.sourceProject);
  const isCloneStorageEnabled = watch(CloneTemplateField.isCloneStorageEnabled);
  const template = watch(CloneTemplateField.template);
  const hasClonableStorage = !!getTemplateBootSourcePVC(template);

  useEffect(() => {
    if (!hasClonableStorage && isCloneStorageEnabled) {
      setValue(CloneTemplateField.isCloneStorageEnabled, false);
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
            name={CloneTemplateField.sourceProject}
          />
        </FormGroup>
      )}
      <FormGroup isRequired label={t('Source template')}>
        <SelectTemplate
          isDisabled={!!initialTemplate}
          namespace={sourceProject}
          onTemplateSelect={onTemplateSelected}
          selectedTemplate={template}
        />
      </FormGroup>
      <FormGroupTextInput
        fieldId={CloneTemplateField.templateName}
        isRequired
        label={t('New template name')}
      />
      <FormGroup isRequired label={t('Template project')}>
        <Controller
          render={({ field: { onChange, value } }) => (
            <SelectProject selectedProject={value} setSelectedProject={onChange} />
          )}
          control={control}
          name={CloneTemplateField.targetProject}
        />
        <FormGroupHelperText>{t('Project name to clone the template to')}</FormGroupHelperText>
      </FormGroup>
      <FormGroupTextInput
        fieldId={CloneTemplateField.templateDisplayName}
        label={t('Template display name')}
      />
      <FormGroupTextInput
        fieldId={CloneTemplateField.templateProvider}
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
          name={CloneTemplateField.isCloneStorageEnabled}
        />
      )}
      {hasClonableStorage && isCloneStorageEnabled && (
        <FormGroupTextInput
          className="pvc-name-form-group"
          fieldId={CloneTemplateField.pvcName}
          isRequired
          label={t("Name of the new template's disk")}
        />
      )}
    </>
  );
};

export default CloneTemplateModalBody;
