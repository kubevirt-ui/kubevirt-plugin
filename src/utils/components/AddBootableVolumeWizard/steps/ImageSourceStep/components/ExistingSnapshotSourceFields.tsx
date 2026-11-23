import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import SelectSnapshot from '@kubevirt-utils/components/SelectSnapshot/SelectSnapshot';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';
import { wizardSetValueOptions } from '../../../form/wizardSetValueOptions';
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
        setValue('imageSource.existingSnapshot.name', name ?? '', wizardSetValueOptions)
      }
      selectSnapshotNamespace={(project) =>
        setValue('imageSource.existingSnapshot.project', project ?? '', wizardSetValueOptions)
      }
      setDiskSize={(size) => setImageSourceDiskSize(getValues, setValue, size)}
      snapshotNameSelected={snapshotName}
      snapshotNamespaceSelected={snapshotProject}
    />
  );
};

export default ExistingSnapshotSourceFields;
