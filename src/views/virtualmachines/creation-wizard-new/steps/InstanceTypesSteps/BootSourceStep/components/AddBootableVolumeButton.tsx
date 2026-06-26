import React, { FC } from 'react';
import { useWatch } from 'react-hook-form';

import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import useOnSelectCreatedVolume from '@virtualmachines/creation-wizard-new/hooks/useOnSelectCreatedVolume';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';

export type AddBootableVolumeButtonProps = {
  loadError: Error;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({ loadError }) => {
  const { t } = useKubevirtTranslation();
  useSignals();
  const { createModal } = useModal();
  const onSelectCreatedVolume = useOnSelectCreatedVolume();
  const { control } = useVMWizard();

  const [volumeListNamespace, preference] = useWatch({
    control,
    name: [
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.VOLUME_LIST_NAMESPACE,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE,
    ],
  });

  const { canCreateDS, canCreatePVC } = useCanCreateBootableVolume(volumeListNamespace);
  const canCreate = canCreateDS || canCreatePVC;

  const isEnabled = runningTourSignal.value || (isEmpty(loadError) && canCreate);

  return (
    <Button
      onClick={() =>
        createModal((props) => (
          <AddBootableVolumeModal
            lockedPreference={preference ?? undefined}
            onCreateVolume={(volume) => onSelectCreatedVolume(volume, null, null, null)}
            {...props}
          />
        ))
      }
      id="tour-step-add-volume"
      isDisabled={!isEnabled}
      variant={ButtonVariant.secondary}
    >
      {t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeButton;
