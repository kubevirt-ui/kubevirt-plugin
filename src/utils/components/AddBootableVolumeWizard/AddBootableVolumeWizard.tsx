import type { FC } from 'react';

import AddBootableVolumeWizardContent from './AddBootableVolumeWizardContent';
import { BootableVolumeWizardFormProvider } from './form/BootableVolumeWizardFormProvider';
import type { BootableVolumeWizardInitialValues } from './form/types';
import BootableVolumeWizardStateProvider from './hooks/useBootableVolumeWizardState';
import type { BootableVolumeWizardCallbacks } from './utils/types';

type AddBootableVolumeWizardProps = BootableVolumeWizardCallbacks & {
  initialValues?: BootableVolumeWizardInitialValues;
  onClose: () => void;
};

const AddBootableVolumeWizard: FC<AddBootableVolumeWizardProps> = ({
  initialValues,
  onClose,
  onCreateVolume,
  onUploadStart,
}) => {
  return (
    <BootableVolumeWizardFormProvider initialValues={initialValues}>
      <BootableVolumeWizardStateProvider>
        <AddBootableVolumeWizardContent
          onClose={onClose}
          onCreateVolume={onCreateVolume}
          onUploadStart={onUploadStart}
        />
      </BootableVolumeWizardStateProvider>
    </BootableVolumeWizardFormProvider>
  );
};

export default AddBootableVolumeWizard;
