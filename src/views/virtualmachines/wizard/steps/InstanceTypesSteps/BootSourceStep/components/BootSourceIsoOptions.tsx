import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import ThisIsAnIsoFileCheckbox from '@kubevirt-utils/components/ThisIsAnIsoFileCheckbox/ThisIsAnIsoFileCheckbox';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, StackItem } from '@patternfly/react-core';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';

import {
  getBootVolumeDiskSizeForIsoState,
  getIsoCheckboxHelpBody,
} from '../utils/isoBootSourceHelpers';
import SystemDiskSizeSection from './SystemDiskSizeSection';

const BootSourceIsoOptions: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control, setValue } = useVMWizardForm();
  const bootVolume = useWatch({ control, name: 'instanceType.bootVolume' });

  const hasVolume = !isEmpty(bootVolume?.volume);
  const isIso = Boolean(bootVolume?.isIso);

  const onIsoChange = (checked: boolean): void => {
    if (!bootVolume) {
      return;
    }

    setValue(
      'instanceType.bootVolume',
      {
        ...bootVolume,
        diskSize: getBootVolumeDiskSizeForIsoState(bootVolume, checked),
        isIso: checked,
      },
      { shouldValidate: true },
    );
  };

  const onDiskSizeChange = (diskSize: string): void => {
    if (!bootVolume) {
      return;
    }

    setValue('instanceType.bootVolume', { ...bootVolume, diskSize }, { shouldValidate: true });
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <ThisIsAnIsoFileCheckbox
          helpBody={getIsoCheckboxHelpBody(t, hasVolume, isIso)}
          isChecked={hasVolume && isIso}
          isDisabled={!hasVolume}
          onChange={onIsoChange}
        />
      </StackItem>
      {hasVolume && isIso && (
        <StackItem>
          <SystemDiskSizeSection onChange={onDiskSizeChange} size={bootVolume?.diskSize} />
        </StackItem>
      )}
    </Stack>
  );
};

export default BootSourceIsoOptions;
