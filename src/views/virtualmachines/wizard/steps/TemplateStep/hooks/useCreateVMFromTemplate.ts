import { useState } from 'react';
import { useWatch } from 'react-hook-form';

import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CUSTOMIZE_VM_BUTTON_CLICKED,
  CUSTOMIZE_VM_FAILED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { logVMCreationFailedFromTemplate } from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getResourceKey } from '@kubevirt-utils/resources/shared';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { getFirstUnfulfilledRequiredParameter } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';
import {
  getVMObjectFromTemplate,
  resolveVMFromTemplate,
} from '@virtualmachines/wizard/steps/TemplateStep/hooks/utils';

type UseCreateVMFromTemplate = () => {
  createVMFromTemplate: () => Promise<boolean>;
  isProcessing: boolean;
};

const useCreateVMFromTemplate: UseCreateVMFromTemplate = () => {
  const { t } = useKubevirtTranslation();
  const { setIsTemplateDrawerOpen, setTemplateProcessError } = useVMWizardState();
  const [isProcessing, setIsProcessing] = useState(false);
  const { control, getValues, setValue } = useVMWizard();
  const cluster = useWatch({ control, name: 'deployment.cluster' });
  const [authorizedSSHKeys] = useKubevirtUserSettings(USER_SETTINGS_KEYS.ssh, cluster);

  const failWithProcessError = (message: string): false => {
    setTemplateProcessError(message);
    setIsTemplateDrawerOpen(true);
    return false;
  };

  const createVMFromTemplate = async (): Promise<boolean> => {
    const { description, folder, name: vmName, project } = getValues('deployment');
    const selectedTemplate = getValues('template.selectedTemplate');
    const namespace = project || DEFAULT_NAMESPACE;
    const lastProcessedTemplateKey = getValues('template.lastProcessedKey');
    setTemplateProcessError(null);

    const selectedKey = getResourceKey(selectedTemplate);
    if (selectedKey === lastProcessedTemplateKey) return true;

    const missingParam = getFirstUnfulfilledRequiredParameter(selectedTemplate);
    if (missingParam) {
      return failWithProcessError(
        t('{{name}} must be filled in to continue.', { name: missingParam.name }),
      );
    }

    logTemplateFlowEvent(CUSTOMIZE_VM_BUTTON_CLICKED, selectedTemplate);

    setIsProcessing(true);
    try {
      const { additionalObjects, vm } = await resolveVMFromTemplate(
        selectedTemplate,
        namespace,
        cluster,
        vmName,
      );

      const vmFromTemplate = getVMObjectFromTemplate({
        description,
        folder,
        namespace,
        selectedTemplate,
        sshSecretName: authorizedSSHKeys?.[namespace],
        vm,
      });

      setValue('customization.vmDraft', vmFromTemplate);

      setValue('template.lastProcessedKey', selectedKey);
      setValue('customization.templateAdditionalObjects', additionalObjects);
      return true;
    } catch (error) {
      const message = (error as Error)?.message ?? String(error);
      logTemplateFlowEvent(CUSTOMIZE_VM_FAILED, selectedTemplate);
      logVMCreationFailedFromTemplate(selectedTemplate, error);
      return failWithProcessError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return { createVMFromTemplate, isProcessing };
};

export default useCreateVMFromTemplate;
