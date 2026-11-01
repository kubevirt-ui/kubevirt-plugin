import type { FC } from 'react';

import AddBootableVolumeWizardContent from './AddBootableVolumeWizardContent';
import { BootableVolumeWizardFormProvider } from './form/BootableVolumeWizardFormProvider';
import type { BootableVolumeWizardInitialValues } from './form/types';
import BootableVolumeWizardStateProvider from './hooks/useBootableVolumeWizardState';

type AddBootableVolumeWizardProps = {
  initialValues?: BootableVolumeWizardInitialValues;
  onClose: () => void;
};

const AddBootableVolumeWizard: FC<AddBootableVolumeWizardProps> = ({ initialValues, onClose }) => {
  return (
    <BootableVolumeWizardFormProvider initialValues={initialValues}>
      <BootableVolumeWizardStateProvider>
        <AddBootableVolumeWizardContent onClose={onClose} />
      </BootableVolumeWizardStateProvider>
    </BootableVolumeWizardFormProvider>
  );
};

export default AddBootableVolumeWizard;
