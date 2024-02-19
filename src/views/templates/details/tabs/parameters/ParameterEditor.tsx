import React, { FC, useState } from 'react';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, ExpandableSection, FormGroup, TextInput } from '@patternfly/react-core';

import ParameterValueEditor from './ParameterValueEditor';

type ParameterEditorProps = {
  isEditDisabled?: boolean;
  onChange: (parameter: TemplateParameter) => void;
  parameter: TemplateParameter;
};

const ParameterEditor: FC<ParameterEditorProps> = ({ isEditDisabled, onChange, parameter }) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setExpanded] = useState(true);

  return (
    <ExpandableSection
      toggleContent={
        <>
          <strong>{t('Name')} </strong> {parameter.name}
        </>
      }
      isExpanded={isExpanded}
      isIndented
      onToggle={(_, expand: boolean) => setExpanded(expand)}
    >
      <FormGroup fieldId={`${parameter.name}-required`}>
        <Checkbox
          id={`${parameter.name}-required`}
          isChecked={parameter.required}
          isDisabled={isEditDisabled}
          label={t('Required')}
          onChange={(_event, required) => onChange({ ...parameter, required })}
        />
      </FormGroup>
      <FormGroup fieldId={`${parameter.name}-description`} label={t('Description')}>
        <TextInput
          id={`${parameter.name}-description`}
          isDisabled={isEditDisabled}
          onChange={(_event, description) => onChange({ ...parameter, description })}
          value={parameter.description}
        />
      </FormGroup>
      <ParameterValueEditor
        isEditDisabled={isEditDisabled}
        onChange={onChange}
        parameter={parameter}
      />
    </ExpandableSection>
  );
};

export default ParameterEditor;
