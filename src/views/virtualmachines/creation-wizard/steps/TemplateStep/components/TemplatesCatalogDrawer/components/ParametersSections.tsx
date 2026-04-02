import React, { FC, useState } from 'react';
import { cloneDeep } from 'lodash';

import { TemplateParameter } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { Button, ButtonVariant, Stack, StackItem } from '@patternfly/react-core';
import { wizardVMSignal } from '@virtualmachines/creation-wizard/state/vm-signal/vmStore';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { useDrawerContext } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/hooks/useDrawerContext';
import { changeTemplateParameterValue } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';

import FieldGroup from './FieldGroup';

type ParametersSectionProps = {
  requiredParameters: TemplateParameter[];
};

const ParametersSections: FC<ParametersSectionProps> = ({ requiredParameters }) => {
  const { t } = useKubevirtTranslation();
  const { setTemplate, template } = useDrawerContext();
  const { setSelectedTemplate } = useVMWizardStore();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const workingTemplate = cloneDeep(template);

  const onFieldValueChange = (name: string, value: string) => {
    setTemplate((draft) => {
      changeTemplateParameterValue(draft, name, value);
    });
  };

  const handleButtonClick = () => {
    if (isEdit) {
      setTemplate(workingTemplate);
      setSelectedTemplate(workingTemplate);
      wizardVMSignal.value = getTemplateVirtualMachineObject(workingTemplate);
      setIsEdit(false);
      return;
    }

    setIsEdit(true);
    return;
  };

  return (
    <Stack className="pf-v6-u-mt-lg" hasGutter>
      <StackItem>
        {requiredParameters.map((param) => (
          <FieldGroup
            field={param}
            isDisabled={!isEdit}
            key={param.name}
            onChange={onFieldValueChange}
          />
        ))}
      </StackItem>
      <StackItem isFilled />
      <StackItem>
        <Button onClick={handleButtonClick} size="sm" variant={ButtonVariant.primary}>
          {isEdit ? t('Save') : t('Edit parameters')}
        </Button>
      </StackItem>
    </Stack>
  );
};

export default ParametersSections;
