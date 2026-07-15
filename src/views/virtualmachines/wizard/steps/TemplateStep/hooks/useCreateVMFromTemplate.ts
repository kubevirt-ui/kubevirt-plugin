import { useState } from 'react';
import { useWatch } from 'react-hook-form';

import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CUSTOMIZE_VM_BUTTON_CLICKED,
  CUSTOMIZE_VM_FAILED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { logVMCreationFailedFromTemplate } from '@kubevirt-utils/extensions/telemetry/vm-creation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getResourceKey } from '@kubevirt-utils/resources/shared';
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import {
  getVMObjectFromTemplate,
  resolveVMFromTemplate,
} from '@virtualmachines/wizard/steps/TemplateStep/hooks/utils';

type UseCreateVMFromTemplate = () => {
  createError: any;
  createVMFromTemplate: () => Promise<void>;
};

const useCreateVMFromTemplate: UseCreateVMFromTemplate = () => {
  const [createError, setCreateError] = useState(undefined);
  const { control, getValues, setValue } = useVMWizard();
  const cluster = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER });
  const [authorizedSSHKeys] = useKubevirtUserSettings(USER_SETTINGS_KEYS.ssh, cluster);

  const createVMFromTemplate = async () => {
    const {
      description,
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
    } catch (error) {
      setCreateError(error);
      logTemplateFlowEvent(CUSTOMIZE_VM_FAILED, selectedTemplate);
      logVMCreationFailedFromTemplate(selectedTemplate, error);
    }
  };

  return { createError, createVMFromTemplate };
};

export default useCreateVMFromTemplate;
