import React, { type FC } from 'react';
import { useController, useWatch } from 'react-hook-form';

import { BOOTABLE_VOLUME_SELECTED, logITFlowEvent } from '@kubevirt-utils/extensions/telemetry';
import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import { getName } from '@kubevirt-utils/resources/shared';
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
import BootableVolumeList from '@virtualmachines/wizard/components/BootableVolumeList/BootableVolumeList';
import { getEffectiveVolumeNamespace } from '@virtualmachines/wizard/components/BootableVolumeList/utils/utils';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { type OnSelectBootableVolume } from '@virtualmachines/wizard/utils/types';
import { applySelectedBootableVolumeToForm } from '@virtualmachines/wizard/utils/utils';

import AddBootableVolumeButton from './components/AddBootableVolumeButton';
import useAddBootableVolume from './hooks/useAddBootableVolume';

const BootSourceStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const { control, getValues, setValue } = useVMWizard();
  const [cluster, project] = useWatch({
    control,
    name: [CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER, CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT] as const,
  });
  const [volumeListNamespace, selectedBootableVolume, preference] = useWatch({
    control,
    name: [
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.VOLUME_LIST_NAMESPACE,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_BOOTABLE_VOLUME,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE,
    ] as const,
  });
  const {
    field: { onChange, value },
  } = useController({
    control,
    name: CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.USE_BOOT_SOURCE,
  });
  const instanceTypesAndPreferencesData = useInstanceTypesAndPreferences(
    getValidNamespace(project),
    cluster,
  );
  const { canCreate, lockedPreference, onCreateVolume } = useAddBootableVolume();

  const effectiveNamespace = getEffectiveVolumeNamespace(volumeListNamespace, isAdmin);

  const bootableVolumesData = useBootableVolumes(effectiveNamespace, cluster);

  const onSelectBootableVolume: OnSelectBootableVolume = (args) => {
    applySelectedBootableVolumeToForm({ ...args, getValues, setValue });
    logITFlowEvent(BOOTABLE_VOLUME_SELECTED, null, {
      selectedBootableVolume: getName(args.selectedVolume),
    });
  };

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
          canCreateVolume={canCreate}
          cluster={cluster}
          instanceTypesAndPreferencesData={instanceTypesAndPreferencesData}
          loadError={instanceTypesAndPreferencesData?.loadError}
          lockedPreference={lockedPreference}
          onCreateVolume={onCreateVolume}
          onSelectBootableVolume={onSelectBootableVolume}
          onVolumeListNamespaceChange={(namespace) =>
            setValue(CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.VOLUME_LIST_NAMESPACE, namespace)
          }
          preferenceName={preference?.name}
          selectedBootableVolume={selectedBootableVolume}
          volumeListNamespace={volumeListNamespace}
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
