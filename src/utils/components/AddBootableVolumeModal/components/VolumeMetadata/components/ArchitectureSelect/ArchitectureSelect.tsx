import React, { FC } from 'react';

import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ARCHITECTURE_TITLE } from '@kubevirt-utils/utils/architecture';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant, FormGroup, SelectOption } from '@patternfly/react-core';

type ArchitectureSelectProps = {
  bootableVolumeState: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const ArchitectureSelect: FC<ArchitectureSelectProps> = ({
  bootableVolumeState,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const workloadArchitectures = useHcoWorkloadArchitectures();

  if (isEmpty(workloadArchitectures)) return null;

  const architectures = bootableVolumeState?.architectures;

  return (
    <>
      <FormGroup label={ARCHITECTURE_TITLE}>
        <FormPFSelect
          closeOnSelect={false}
          selected={architectures}
          selectedLabel={architectures?.join(', ') ?? t('Select architecture')}
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
      {!isEmpty(architectures) && (
        <Alert
          title={t(
            'Every selected architecture will create a DataSource resource with the selected architecture added as suffix to the bootable volume name.',
          )}
          isInline
          isPlain
          variant={AlertVariant.info}
        />
      )}
    </>
  );
};

export default ArchitectureSelect;
