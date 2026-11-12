import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import SelectSnapshot from '@kubevirt-utils/components/SelectSnapshot/SelectSnapshot';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';
import { imageSourceSetValueOptions } from '../utils/resetImageSourceFields';
import { setImageSourceDiskSize } from '../utils/setImageSourceDiskSize';

const ExistingSnapshotSourceFields: FC = () => {
  const { cluster, control, getValues, setValue } = useBootableVolumeWizardForm();

  const [snapshotName, snapshotProject] = useWatch({
    control,
    name: ['imageSource.existingSnapshot.name', 'imageSource.existingSnapshot.project'],
  });

  return (
    <SelectSnapshot
      cluster={cluster}
      selectSnapshotName={(name) =>
        setValue('imageSource.existingSnapshot.name', name ?? '', imageSourceSetValueOptions)
      }
      selectSnapshotNamespace={(project) =>
        setValue('imageSource.existingSnapshot.project', project ?? '', imageSourceSetValueOptions)
      }
      setDiskSize={(size) => setImageSourceDiskSize(getValues, setValue, size)}
      snapshotNameSelected={snapshotName}
      snapshotNamespaceSelected={snapshotProject}
    />
  );
};

export default ExistingSnapshotSourceFields;
