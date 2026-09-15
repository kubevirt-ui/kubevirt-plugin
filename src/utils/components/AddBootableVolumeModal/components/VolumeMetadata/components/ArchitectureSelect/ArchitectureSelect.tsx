import { type FC, type ReactElement } from 'react';

import {
  type AddBootableVolumeState,
  type SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ARCHITECTURE_TITLE } from '@kubevirt-utils/utils/architecture';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { FormGroup, PopoverPosition, SelectOption } from '@patternfly/react-core';

type ArchitectureSelectProps = {
  bootableVolumeState: AddBootableVolumeState;
  isDisabled?: boolean;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const ArchitectureSelect: FC<ArchitectureSelectProps> = ({
  bootableVolumeState,
  isDisabled,
  setBootableVolumeField,
}): ReactElement | null => {
  const { t } = useKubevirtTranslation();
  const [workloadArchitectures] = useHcoWorkloadArchitectures(
    bootableVolumeState?.bootableVolumeCluster,
  );

  if (isEmpty(workloadArchitectures)) return null;

  const architectures = bootableVolumeState?.architectures;

  return (
    <>
      <FormGroup
        label={t(ARCHITECTURE_TITLE)}
        labelHelp={
          <HelpTextIcon
            bodyContent={(hide) => (
              <PopoverContentWithLightspeedButton
                content={t(
                  'The architecture type will be added as a suffix to the bootable volume name.',
                )}
                hide={hide}
                promptType={OLSPromptType.BOOTABLE_VOLUME_ARCHITECTURES}
              />
            )}
            position={PopoverPosition.right}
          />
        }
      >
        <FormPFSelect
          closeOnSelect={true}
          isDisabled={isDisabled}
          selected={architectures}
          selectedLabel={
            architectures?.length ? architectures.join(', ') : t('Select architecture')
          }
          toggleProps={{ isFullWidth: true }}
        >
          {workloadArchitectures.map((arch: string) => (
            <SelectOption
              hasCheckbox
              isSelected={architectures?.includes(arch)}
              key={arch}
              onClick={() =>
                setBootableVolumeField('architectures')(
                  architectures?.includes(arch)
                    ? architectures.filter((a) => a !== arch)
                    : [...(architectures ?? []), arch],
                )
              }
              value={arch}
            >
              {arch}
            </SelectOption>
          ))}
        </FormPFSelect>
      </FormGroup>
    </>
  );
};

export default ArchitectureSelect;
