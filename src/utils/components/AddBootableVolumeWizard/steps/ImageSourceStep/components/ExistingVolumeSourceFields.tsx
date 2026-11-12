import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import DiskSourcePVCSelect from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeSource/components/DiskSourcePVCSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import PVCClonePermissionAlert from '@kubevirt-utils/components/PVCClonePermissionAlert/PVCClonePermissionAlert';
import useCanClonePVCFromNamespace from '@kubevirt-utils/hooks/useCanClonePVCFromNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Checkbox, PopoverPosition, Split, SplitItem } from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';
import { imageSourceSetValueOptions } from '../utils/resetImageSourceFields';
import { setImageSourceDiskSize } from '../utils/setImageSourceDiskSize';

const ExistingVolumeSourceFields: FC = () => {
  const { t } = useKubevirtTranslation();
  const { cluster, control, getValues, setValue } = useBootableVolumeWizardForm();

  const [destinationProject, volumeName, volumeProject] = useWatch({
    control,
    name: [
      'projectAndVolume.destinationProject',
      'imageSource.existingVolume.name',
      'imageSource.existingVolume.project',
    ],
  });

  const { showClonePermissionError } = useCanClonePVCFromNamespace(
    volumeProject,
    destinationProject,
    cluster,
  );

  return (
    <>
      <DiskSourcePVCSelect
        cluster={cluster}
        pvcNameSelected={volumeName}
        pvcNamespaceSelected={volumeProject}
        selectPVCName={(name) =>
          setValue('imageSource.existingVolume.name', name ?? '', imageSourceSetValueOptions)
        }
        selectPVCNamespace={(project) =>
          setValue('imageSource.existingVolume.project', project ?? '', imageSourceSetValueOptions)
        }
        setDiskSize={(size) => setImageSourceDiskSize(getValues, setValue, size)}
      />
      {showClonePermissionError && (
        <PVCClonePermissionAlert className="pf-v6-u-mt-sm" sourceNamespace={volumeProject} />
      )}
      <Split hasGutter>
        <SplitItem>
          <Checkbox
            id="clone-pvc-checkbox"
            isChecked
            isDisabled
            label={t('Clone existing Volume')}
          />
        </SplitItem>
        <SplitItem>
          <HelpTextIcon
            bodyContent={(hide) => (
              <PopoverContentWithLightspeedButton
                content={t(
                  'This will create a cloned copy of the Volume in the destination project.',
                )}
                hide={hide}
                promptType={OLSPromptType.CLONE_VOLUME}
              />
            )}
            position={PopoverPosition.right}
          />
        </SplitItem>
      </Split>
    </>
  );
};

export default ExistingVolumeSourceFields;
