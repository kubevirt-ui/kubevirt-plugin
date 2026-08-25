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
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const { control, getValues, setValue } = useVMWizard();
  const cluster = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER });
  const [authorizedSSHKeys] = useKubevirtUserSettings(USER_SETTINGS_KEYS.ssh, cluster);

  const failWithProcessError = (message: string): false => {
    setValue(CREATE_VM_FORM_FIELDS_UI_STATE.TEMPLATE_PROCESS_ERROR, message);
    setValue(CREATE_VM_FORM_FIELDS_UI_STATE.IS_TEMPLATES_DRAWER_OPEN, true);
    return false;
  };

  const createVMFromTemplate = async (): Promise<boolean> => {
    const {
      description,
      folder,
      name: vmName,
      project,
      selectedTemplate,
    } = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.ROOT);
    const namespace = project || DEFAULT_NAMESPACE;
    const lastProcessedTemplateKey = getValues(
      CREATE_VM_FORM_FIELDS_UI_STATE.LAST_PROCESSED_TEMPLATE_KEY,
    );
    setValue(CREATE_VM_FORM_FIELDS_UI_STATE.TEMPLATE_PROCESS_ERROR, null);

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
      const vm = await resolveVMFromTemplate(selectedTemplate, namespace, cluster, vmName);

      customizeWizardVMSignal.value = getVMObjectFromTemplate({
        description,
        folder,
        namespace,
        selectedTemplate,
        sshSecretName: authorizedSSHKeys?.[namespace],
        vm,
      });
      setValue(CREATE_VM_FORM_FIELDS_UI_STATE.LAST_PROCESSED_TEMPLATE_KEY, selectedKey);
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
