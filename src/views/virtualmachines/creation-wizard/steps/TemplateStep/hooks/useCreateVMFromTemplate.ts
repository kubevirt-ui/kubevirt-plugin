import { useState } from 'react';

import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CUSTOMIZE_VM_BUTTON_CLICKED,
  CUSTOMIZE_VM_FAILED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { ProcessedTemplatesModel } from '@kubevirt-utils/models';
import { getLabels } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject, Template } from '@kubevirt-utils/resources/template';
import { getDefaultRunningStrategy, getRunStrategy } from '@kubevirt-utils/resources/vm';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
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
      const processedTemplate = await kubevirtK8sCreate<Template>({
        cluster,
        data: { ...selectedTemplate, metadata: { ...selectedTemplate?.metadata, namespace } },
        model: ProcessedTemplatesModel,
        ns: namespace,
        queryParams: {
          dryRun: 'All',
        },
      });

      const vmObject = getTemplateVirtualMachineObject(processedTemplate);

      vmObject.metadata.namespace = namespace;
      if (folder) vmObject.metadata.labels = { ...getLabels(vmObject), [VM_FOLDER_LABEL]: folder };
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
