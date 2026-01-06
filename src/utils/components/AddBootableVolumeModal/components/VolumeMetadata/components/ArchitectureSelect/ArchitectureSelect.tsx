import React, { FC } from 'react';

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
import { FormGroup, PopoverPosition, SelectOption } from '@patternfly/react-core';

type ArchitectureSelectProps = {
  bootableVolumeState: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const ArchitectureSelect: FC<ArchitectureSelectProps> = ({
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
            bodyContent={t(
              'The architecture type will be added as a suffix to the bootable volume name.',
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
