import { useState } from 'react';

import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CUSTOMIZE_VM_BUTTON_CLICKED,
  CUSTOMIZE_VM_FAILED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { getLabels, getResourceKey } from '@kubevirt-utils/resources/shared';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import { getDefaultRunningStrategy } from '@kubevirt-utils/resources/vm';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { resolveVMFromTemplate } from '@virtualmachines/creation-wizard/steps/TemplateStep/hooks/utils';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

type UseCreateVMFromTemplate = () => {
  createError: any;
  createVMFromTemplate: () => Promise<void>;
};

const useCreateVMFromTemplate: UseCreateVMFromTemplate = () => {
  const [createError, setCreateError] = useState(undefined);
  const {
    cluster,
    folder,
    lastProcessedTemplateKey,
    project: namespace,
    selectedTemplate,
    setLastProcessedTemplateKey,
    vmDescription,
    vmName,
  } = useVMWizardStore();

  const createVMFromTemplate = async () => {
    setCreateError(undefined);

    const selectedKey = getResourceKey(selectedTemplate);
    if (selectedKey === lastProcessedTemplateKey) return;

    logTemplateFlowEvent(CUSTOMIZE_VM_BUTTON_CLICKED, selectedTemplate);

    try {
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
      setLastProcessedTemplateKey(selectedKey);
    } catch (error) {
      setCreateError(error);
      logTemplateFlowEvent(CUSTOMIZE_VM_FAILED, selectedTemplate);
    }
  };

  return { createError, createVMFromTemplate };
};

export default useCreateVMFromTemplate;
