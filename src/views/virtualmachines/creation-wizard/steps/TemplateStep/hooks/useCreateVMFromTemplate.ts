import { useState } from 'react';

import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CUSTOMIZE_VM_BUTTON_CLICKED,
  CUSTOMIZE_VM_FAILED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { getLabels } from '@kubevirt-utils/resources/shared';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import { getDefaultRunningStrategy, getRunStrategy } from '@kubevirt-utils/resources/vm';
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
  const { cluster, folder, project: namespace, selectedTemplate } = useVMWizardStore();

  const createVMFromTemplate = async () => {
    setCreateError(undefined);

    logTemplateFlowEvent(CUSTOMIZE_VM_BUTTON_CLICKED, selectedTemplate);

    try {
      const vmObject = await resolveVMFromTemplate(selectedTemplate, namespace, cluster);

      vmObject.metadata.namespace = namespace;
      vmObject.metadata.labels = {
        ...getLabels(vmObject),
        [LABEL_USED_TEMPLATE_NAME]: selectedTemplate.metadata.name,
        [LABEL_USED_TEMPLATE_NAMESPACE]: selectedTemplate.metadata.namespace,
        ...(folder ? { [VM_FOLDER_LABEL]: folder } : {}),
      };

      if (!getRunStrategy(vmObject)) vmObject.spec.runStrategy = getDefaultRunningStrategy();

      vmSignal.value = vmObject;
    } catch (error) {
      setCreateError(error);
      logTemplateFlowEvent(CUSTOMIZE_VM_FAILED, selectedTemplate);
    }
  };

  return { createError, createVMFromTemplate };
};

export default useCreateVMFromTemplate;
