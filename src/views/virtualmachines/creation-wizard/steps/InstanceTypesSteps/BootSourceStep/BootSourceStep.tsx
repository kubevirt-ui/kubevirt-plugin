import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import BootableVolumeList from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/BootableVolumeList';
import useInstanceTypesAndPreferences from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/hooks/useInstanceTypesAndPreferences';

import AddBootableVolumeButton from './components/AddBootableVolumeButton';

const BootSourceStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const [useBootSource, setUseBootSource] = useState<boolean>(true);
  const { project } = useVMWizardStore();
  const instanceTypesAndPreferencesData = useInstanceTypesAndPreferences(
    getValidNamespace(project),
  );

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Boot source')}
        </Title>
      </StackItem>
      <StackItem>
        {t(
          'Choose how the VirtualMachine will start. You can select a bootable disk now or configure storage after creation.',
        )}
      </StackItem>
      <StackItem>
        <Split>
          <SplitItem>
            <Radio
              description={t(
                'Start your VM with an existing disk image or volume from your project.',
              )}
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
        <BootableVolumeList instanceTypesAndPreferencesData={instanceTypesAndPreferencesData} />
      )}
      <StackItem>
        <Radio
          description={t(
            'Create an empty VirtualMachine. You can mount an ISO or attach storage during the customization step.',
          )}
          id="no-boot-volume-option"
          isChecked={!useBootSource}
          label={t('No boot source')}
          name="boot-volume"
          onChange={() => setUseBootSource(false)}
        />
      </StackItem>
    </Stack>
  );
};

export default BootSourceStep;
