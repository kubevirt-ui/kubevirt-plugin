import React, { FC } from 'react';
import { useController, useWatch } from 'react-hook-form';

import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
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
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import BootableVolumeList from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/BootableVolumeList';

import AddBootableVolumeButton from './components/AddBootableVolumeButton';
import { getEffectiveVolumeNamespace } from './components/BootableVolumeList/utils/utils';

const BootSourceStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const { control } = useVMWizard();
  const project = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT });
  const volumeListNamespace = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.VOLUME_LIST_NAMESPACE,
  });
  const {
    field: { onChange, value },
  } = useController({
    control,
    name: CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.USE_BOOT_SOURCE,
  });
  const instanceTypesAndPreferencesData = useInstanceTypesAndPreferences(
    getValidNamespace(project),
  );

  const effectiveNamespace = getEffectiveVolumeNamespace(volumeListNamespace, isAdmin);

  const bootableVolumesData = useBootableVolumes(effectiveNamespace);

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
              isChecked={value}
              label={t('Boot volume')}
              name="boot-volume"
              onChange={() => onChange(true)}
            />
          </SplitItem>
          <SplitItem isFilled />
          <SplitItem>
            <AddBootableVolumeButton loadError={instanceTypesAndPreferencesData?.loadError} />
          </SplitItem>
        </Split>
      </StackItem>
      {value && (
        <BootableVolumeList
          bootableVolumesData={bootableVolumesData}
          instanceTypesAndPreferencesData={instanceTypesAndPreferencesData}
        />
      )}
      <StackItem>
        <Radio
          description={t('Assign a boot source for your VM during the customization step.')}
          id="no-boot-volume-option"
          isChecked={!value}
          label={t('No boot source')}
          name="boot-volume"
          onChange={() => onChange(false)}
        />
      </StackItem>
    </Stack>
  );
};

export default BootSourceStep;
