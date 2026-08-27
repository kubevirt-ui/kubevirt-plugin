import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';

import {
  BOOTABLE_VOLUME_SELECTED,
  logTemplateFlowEvent,
} from '@kubevirt-utils/extensions/telemetry';
import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { getEffectiveVolumeNamespace } from '@virtualmachines/wizard/components/BootableVolumeList/utils/utils';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_UI_STATE,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { useDrawerContext } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/hooks/useDrawerContext';
import { type OnSelectBootableVolume } from '@virtualmachines/wizard/utils/types';

import {
  type ChangeBootSourceModalProps,
  type UseChangeBootSourceModalValues,
} from '../utils/types';
import { buildBootSourceOverride, getChangeBootSourcePreferenceData } from '../utils/utils';

type UseChangeBootSourceModal = (
  props: ChangeBootSourceModalProps,
) => UseChangeBootSourceModalValues;

const useChangeBootSourceModal: UseChangeBootSourceModal = ({ isOpen, onClose, vm }) => {
  const { control, setValue } = useVMWizard();
  const { template } = useDrawerContext();
  const isAdmin = useIsAdmin();

  const cluster = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER });
  const project = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT });

  const [volumeListNamespace, setVolumeListNamespace] = useState('');
  const [selectedBootableVolume, setSelectedBootableVolume] = useState<BootableVolume | undefined>(
    undefined,
  );

  // Reset the pending selection each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedBootableVolume(undefined);
    }
  }, [isOpen]);

  const effectiveNamespace = getEffectiveVolumeNamespace(volumeListNamespace, isAdmin);
  const bootableVolumesData = useBootableVolumes(effectiveNamespace, cluster);
  const instanceTypesAndPreferencesData = useInstanceTypesAndPreferences(
    effectiveNamespace,
    cluster,
  );

  const { canCreateDS, canCreatePVC } = useCanCreateBootableVolume(project);
  const canCreate = canCreateDS || canCreatePVC;

  const { lockedPreference, preferenceName } = getChangeBootSourcePreferenceData(
    vm,
    template,
    instanceTypesAndPreferencesData.preferences,
  );

  const applyBootSourceOverride = (volume: BootableVolume): void => {
    setValue(CREATE_VM_FORM_FIELDS_VM_DATA.BOOT_SOURCE_OVERRIDE, buildBootSourceOverride(volume));
    // Force reprocessing so the override applies even if the template was already processed.
    setValue(CREATE_VM_FORM_FIELDS_UI_STATE.LAST_PROCESSED_TEMPLATE_KEY, '');
  };

  const onConfirm = (): void => {
    if (!selectedBootableVolume) return;

    applyBootSourceOverride(selectedBootableVolume);
    onClose();
  };

  const onSelectBootableVolume: OnSelectBootableVolume = (args) => {
    setSelectedBootableVolume(args.selectedVolume);
    logTemplateFlowEvent(BOOTABLE_VOLUME_SELECTED, template, {
      selectedBootableVolume: getName(args.selectedVolume),
    });
  };

  // Uploads close the "Add new boot source" sub-modal immediately and finish in the
  // background (see submitAddBootableVolume), so this can fire long after the user has
  // moved on. Apply the override and reflect the new volume as the selection so the list
  // and Confirm button match the committed state — but don't close this modal out from
  // under them.
  const onCreateVolume = (volume: BootableVolume): void => {
    applyBootSourceOverride(volume);
    setSelectedBootableVolume(volume);
  };

  return {
    bootableVolumesData,
    canCreate,
    cluster,
    instanceTypesAndPreferencesData,
    lockedPreference,
    onConfirm,
    onCreateVolume,
    onSelectBootableVolume,
    preferenceName,
    selectedBootableVolume,
    setVolumeListNamespace,
    volumeListNamespace,
  };
};

export default useChangeBootSourceModal;
