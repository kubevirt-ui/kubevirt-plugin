import React, { FC } from 'react';

import { TemplateParameter } from '@kubevirt-ui-ext/kubevirt-api/console';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { changeTemplateParameterValue } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';

import FieldGroup from './FieldGroup';

type ParametersSectionProps = {
  requiredParameters: TemplateParameter[];
};

const ParametersSections: FC<ParametersSectionProps> = ({ requiredParameters }) => {
  const { selectedTemplate, setSelectedTemplate } = useVMWizardStore();

  const onFieldValueChange = (name: string, value: string) => {
    const templateCopy = { ...selectedTemplate, parameters: [...selectedTemplate.parameters] };
    setSelectedTemplate(changeTemplateParameterValue(templateCopy, name, value));
  };

  return (
    <div className="pf-v6-u-mt-lg">
      {requiredParameters.map((param) => (
        <FieldGroup field={param} key={param.name} onChange={onFieldValueChange} />
      ))}
    </div>
  );
};

export default ParametersSections;
