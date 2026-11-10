import type { FC } from 'react';
import { useController } from 'react-hook-form';

import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';

type DiskSizeInputProps = {
  helperText?: string;
  isDisabled?: boolean;
};

const DiskSizeInput: FC<DiskSizeInputProps> = ({ helperText, isDisabled }) => {
  const { t } = useKubevirtTranslation();
  const { control } = useBootableVolumeWizardForm();
  const {
    field: { onChange, value },
  } = useController({ control, name: 'imageSource.diskSize' });

  return (
    <CapacityInput
      helperText={helperText}
      isDisabled={isDisabled}
      label={t('Disk size')}
      onChange={onChange}
      size={value}
    />
  );
};

export default DiskSizeInput;
