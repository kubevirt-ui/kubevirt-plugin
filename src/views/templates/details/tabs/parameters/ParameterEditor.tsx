import * as React from 'react';

import { TemplateParameter } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, ExpandableSection, FormGroup, TextInput } from '@patternfly/react-core';

import ParameterValueEditor from './ParameterValueEditor';

type ParameterEditorProps = {
  parameter: TemplateParameter;
  onChange: (parameter: TemplateParameter) => void;
};

const ParameterEditor: React.FC<ParameterEditorProps> = ({ parameter, onChange }) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setExpanded] = React.useState(true);

  return (
    <ExpandableSection
      isExpanded={isExpanded}
      isIndented
      onToggle={setExpanded}
      toggleContent={
        <>
          <strong>{t('Name')} </strong> {parameter.name}
        </>
      }
    >
      <FormGroup fieldId={`${parameter.name}-required`}>
        <Checkbox
          label={t('Required')}
          isChecked={parameter.required}
          onChange={(required) => onChange({ ...parameter, required })}
          id={`${parameter.name}-required`}
        />
      </FormGroup>
      <FormGroup fieldId={`${parameter.name}-description`} label={t('Description')}>
        <TextInput
          id={`${parameter.name}-description`}
          value={parameter.description}
          onChange={(description) => onChange({ ...parameter, description })}
        />
      </FormGroup>
      <ParameterValueEditor parameter={parameter} onChange={onChange} />
    </ExpandableSection>
  );
};

export default ParameterEditor;
