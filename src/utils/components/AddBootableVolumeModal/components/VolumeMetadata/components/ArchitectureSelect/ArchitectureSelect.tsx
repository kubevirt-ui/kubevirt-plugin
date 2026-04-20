import React, { FCC } from 'react';

import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
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
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const ArchitectureSelect: FCC<ArchitectureSelectProps> = ({
  bootableVolumeState,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const workloadArchitectures = useHcoWorkloadArchitectures(
    bootableVolumeState?.bootableVolumeCluster,
  );

  if (isEmpty(workloadArchitectures)) return null;

  const architectures = bootableVolumeState?.architectures;

  return (
    <>
      <FormGroup
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
        label={t(ARCHITECTURE_TITLE)}
      >
        <FormPFSelect
          selectedLabel={
            architectures?.length ? architectures.join(', ') : t('Select architecture')
          }
          closeOnSelect={true}
          selected={architectures}
          toggleProps={{ isFullWidth: true }}
        >
          {workloadArchitectures.map((arch: string) => (
            <SelectOption
              onClick={() =>
                setBootableVolumeField('architectures')(
                  architectures?.includes(arch)
                    ? architectures.filter((a) => a !== arch)
                    : [...(architectures || []), arch],
                )
              }
              hasCheckbox
              isSelected={architectures?.includes(arch)}
              key={arch}
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
