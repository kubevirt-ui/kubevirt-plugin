import { type FC } from 'react';

import AddBootableVolumeWizard from '@kubevirt-utils/components/AddBootableVolumeWizard/AddBootableVolumeWizard';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';

import useAddBootableVolume from '../hooks/useAddBootableVolume';

type AddBootableVolumeButtonProps = {
  loadError: Error;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({ loadError }) => {
  const { t } = useKubevirtTranslation();
  useSignals();
  const { createModal } = useModal();
  const { canCreate, cluster, lockedPreference, namespace, onCreateVolume, onUploadStart } =
    useAddBootableVolume();

  const isEnabled = runningTourSignal.value || (isEmpty(loadError) && canCreate);

  const openAddBootableVolumeWizard = (): void => {
    createModal(({ onClose }) => (
      <AddBootableVolumeWizard
        initialValues={{ cluster, lockedPreference, namespace }}
        onClose={onClose}
        onCreateVolume={onCreateVolume}
        onUploadStart={onUploadStart}
      />
    ));
  };

  return (
    <Button
      id="tour-step-add-volume"
      isDisabled={!isEnabled}
      onClick={openAddBootableVolumeWizard}
      variant={ButtonVariant.secondary}
    >
      {t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeButton;
