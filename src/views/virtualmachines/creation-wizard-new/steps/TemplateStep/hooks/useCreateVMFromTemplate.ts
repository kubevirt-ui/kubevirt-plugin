import { useState } from 'react';

import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CUSTOMIZE_VM_BUTTON_CLICKED,
  CUSTOMIZE_VM_FAILED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { logVMCreationFailedFromTemplate } from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { getLabels, getResourceKey } from '@kubevirt-utils/resources/shared';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import { getDefaultRunningStrategy } from '@kubevirt-utils/resources/vm';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import { resolveVMFromTemplate } from '@virtualmachines/creation-wizard-new/steps/TemplateStep/hooks/utils';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

type UseCreateVMFromTemplate = () => {
  createError: any;
  createVMFromTemplate: () => Promise<void>;
};

const useCreateVMFromTemplate: UseCreateVMFromTemplate = () => {
  const [createError, setCreateError] = useState(undefined);
  const { getValues, setValue } = useVMWizard();

  const createVMFromTemplate = async () => {
    const {
      cluster,
      folder,
      name: vmName,
      project: namespace,
      selectedTemplate,
    } = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.ROOT);
    const lastProcessedTemplateKey = getValues(
      CREATE_VM_FORM_FIELDS_UI_STATE.LAST_PROCESSED_TEMPLATE_KEY,
    );
    setCreateError(undefined);

    const selectedKey = getResourceKey(selectedTemplate);
    if (selectedKey === lastProcessedTemplateKey) return;

    logTemplateFlowEvent(CUSTOMIZE_VM_BUTTON_CLICKED, selectedTemplate);

    try {
      const vmDescription = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.DESCRIPTION);
      const vmObject = await resolveVMFromTemplate(selectedTemplate, namespace, cluster, vmName);

      vmObject.metadata.namespace = namespace;
      vmObject.metadata.labels = {
        ...getLabels(vmObject),
        [LABEL_USED_TEMPLATE_NAME]: selectedTemplate.metadata.name,
        [LABEL_USED_TEMPLATE_NAMESPACE]: selectedTemplate.metadata.namespace,
        ...(folder ? { [VM_FOLDER_LABEL]: folder } : {}),
      };
      if (vmDescription) {
        vmObject.metadata.annotations = {
          ...vmObject.metadata.annotations,
          description: vmDescription,
        };
      }
      vmObject.spec.runStrategy = getDefaultRunningStrategy();

      vmSignal.value = vmObject;
      setValue(CREATE_VM_FORM_FIELDS_UI_STATE.LAST_PROCESSED_TEMPLATE_KEY, selectedKey);
    } catch (error) {
      setCreateError(error);
      logTemplateFlowEvent(CUSTOMIZE_VM_FAILED, selectedTemplate);
      logVMCreationFailedFromTemplate(selectedTemplate, error);
    }
  };

  return { createError, createVMFromTemplate };
};

export default useCreateVMFromTemplate;
