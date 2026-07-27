import { useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import useAutoAppliedLabels from '@kubevirt-utils/hooks/useAutoAppliedLabels/useAutoAppliedLabels';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getLabels } from '@kubevirt-utils/resources/shared';
import {
  customizeWizardVMSignal,
  patchCustomizeWizardVMSignal,
} from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useSignals } from '@preact/signals-react/runtime';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';

const useApplyAutoLabels = (): void => {
  useSignals();
  const { control, setValue } = useVMWizard();
  const autoLabelsMerged = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_VM_DATA.AUTO_LABELS_MERGED,
  });
  const { labels, loaded: adminLoaded } = useAutoAppliedLabels();
  const [userDefaults, , userLoaded] = useKubevirtUserSettings(USER_SETTINGS_KEYS.defaultVMLabels);
  const mergedRef = useRef(false);

  const vm = customizeWizardVMSignal.value;

  useEffect(() => {
    if (!vm) {
      mergedRef.current = false;
      if (autoLabelsMerged) {
        setValue(CREATE_VM_FORM_FIELDS_VM_DATA.AUTO_LABELS_MERGED, false);
      }
      return;
    }

    if (mergedRef.current || !adminLoaded || !userLoaded || isEmpty(labels)) return;

    const existingLabels = getLabels(vm, {});
    const labelsToMerge = labels.reduce<Record<string, string>>((acc, { key, value }) => {
      if (!existingLabels[key]) {
        acc[key] = String(value || userDefaults?.[key] || '');
      }
      return acc;
    }, {});

    if (!isEmpty(labelsToMerge)) {
      patchCustomizeWizardVMSignal([{ data: labelsToMerge, merge: true, path: 'metadata.labels' }]);
    }

    mergedRef.current = true;
    setValue(CREATE_VM_FORM_FIELDS_VM_DATA.AUTO_LABELS_MERGED, true);
  }, [vm, labels, adminLoaded, userLoaded, userDefaults, autoLabelsMerged, setValue]);
};

export default useApplyAutoLabels;
