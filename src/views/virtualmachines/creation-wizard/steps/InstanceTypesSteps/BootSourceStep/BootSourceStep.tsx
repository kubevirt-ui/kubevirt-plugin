import React, { FC, useState } from 'react';

import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import {
  Radio,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import BootableVolumeList from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/BootableVolumeList';
import BootableVolumesPipelinesHint from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/components/BootableVolumesPipelinesHint/BootableVolumesPipelinesHint';

import AddBootableVolumeButton from './components/AddBootableVolumeButton';

const BootSourceStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const [useBootSource, setUseBootSource] = useState<boolean>(true);
  const { project } = useVMWizardStore();
  const instanceTypesAndPreferencesData = useInstanceTypesAndPreferences(
    getValidNamespace(project),
  );
  const { volumeListNamespace } = useInstanceTypeVMStore();
  const bootableVolumesData = useBootableVolumes(volumeListNamespace);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Boot source')}
        </Title>
      </StackItem>
      <StackItem>{t('Select a boot source (volume or ISO) now or configure it later.')}</StackItem>
      <StackItem>
        <Split>
          <SplitItem>
            <Radio
              description={t('Create your VM from an existing boot source or add a new one.')}
              id="boot-volume-option"
              isChecked={useBootSource}
              label={t('Boot volume')}
              name="boot-volume"
              onChange={() => setUseBootSource(true)}
            />
          </SplitItem>
          <SplitItem isFilled />
          <SplitItem>
            <AddBootableVolumeButton loadError={instanceTypesAndPreferencesData?.loadError} />
          </SplitItem>
        </Split>
      </StackItem>
      {useBootSource && (
        <BootableVolumeList
          bootableVolumesData={bootableVolumesData}
          instanceTypesAndPreferencesData={instanceTypesAndPreferencesData}
        />
      )}
      <StackItem>
        <Radio
          description={t('Assign a boot source for your VM during the customization step.')}
          id="no-boot-volume-option"
          isChecked={!useBootSource}
          label={t('No boot source')}
          name="boot-volume"
          onChange={() => setUseBootSource(false)}
        />
      </StackItem>
      <StackItem isFilled />
      <StackItem>
        <BootableVolumesPipelinesHint bootableVolumes={bootableVolumesData?.bootableVolumes} />
      </StackItem>
    </Stack>
  );
};

export default BootSourceStep;
