import { type FC, useMemo } from 'react';
import { useController, useWatch } from 'react-hook-form';

import { BOOTABLE_VOLUME_SELECTED, logITFlowEvent } from '@kubevirt-utils/extensions/telemetry';
import { useCanListNamespaces } from '@kubevirt-utils/hooks/useCanListNamespaces';
import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
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
import {
  createTableRowFromSelection,
  getEffectiveVolumeNamespace,
} from '@virtualmachines/wizard/components/BootableVolumeList/utils/utils';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { type OnSelectBootableVolume } from '@virtualmachines/wizard/utils/types';
import { applySelectedBootableVolumeToForm } from '@virtualmachines/wizard/utils/utils';

import AddBootableVolumeButton from './components/AddBootableVolumeButton';
import useAddBootableVolume from './hooks/useAddBootableVolume';

const BootSourceStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const canListAllNamespaces = useCanListNamespaces();
  const { control, setValue } = useVMWizardForm();

  const [
    cluster,
    project,
    volumeListNamespace,
    selectedBootableVolume,
    guestOperatingSystem,
    selectedPreference,
    useBootSource,
  ] = useWatch({
    control,
    name: [
      'deployment.cluster',
      'deployment.project',
      'instanceType.volumeNamespace',
      'instanceType.bootVolume.volume',
      'instanceType.guestOperatingSystem',
      'instanceType.preference',
      'instanceType.useBootSource',
    ],
  });

  const {
    field: { onChange, value },
  } = useController({
    control,
    name: 'instanceType.useBootSource',
    rules: { deps: 'instanceType.bootVolume' },
  });

  const instanceTypesAndPreferencesData = useInstanceTypesAndPreferences(
    getValidNamespace(project),
    cluster,
  );
  const { canCreate, lockedPreference, onCreateVolume, onUploadStart } = useAddBootableVolume();

  const effectiveNamespace = getEffectiveVolumeNamespace(volumeListNamespace, canListAllNamespaces);

  const bootableVolumesData = useBootableVolumes(effectiveNamespace, cluster);

  const selectedTableRow = useMemo(
    () => createTableRowFromSelection(selectedBootableVolume, selectedPreference),
    [selectedBootableVolume, selectedPreference],
  );

  const onSelectBootableVolume: OnSelectBootableVolume = (args) => {
    applySelectedBootableVolumeToForm({ ...args, setValue });
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
            {useBootSource && (
              <AddBootableVolumeButton loadError={instanceTypesAndPreferencesData?.loadError} />
            )}
          </SplitItem>
        </Split>
      </StackItem>
      {value && (
        <BootableVolumeList
          bootableVolumesData={bootableVolumesData}
          canCreateVolume={canCreate}
          cluster={cluster}
          guestOperatingSystem={guestOperatingSystem}
          instanceTypesAndPreferencesData={instanceTypesAndPreferencesData}
          loadError={instanceTypesAndPreferencesData?.loadError}
          lockedPreference={lockedPreference}
          onCreateVolume={onCreateVolume}
          onSelectBootableVolume={onSelectBootableVolume}
          onUploadStart={onUploadStart}
          onVolumeListNamespaceChange={(namespace) =>
            setValue('instanceType.volumeNamespace', namespace)
          }
          selectedTableRow={selectedTableRow}
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
