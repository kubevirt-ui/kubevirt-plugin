import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import CapacityInput from '../../../CapacityInput/CapacityInput';
import { DiskFormState, SourceTypes } from '../../utils/types';
import { diskSizeField, diskSourceField } from '../utils/constants';

import DynamicSize from './DynamicSize';

type DiskSizeInputProps = { isEditingCreatedDisk: boolean };

const DiskSizeInput: FC<DiskSizeInputProps> = ({ isEditingCreatedDisk }) => {
  const { t } = useKubevirtTranslation();
  const { control, watch } = useFormContext<DiskFormState>();
  const diskSource = watch(diskSourceField);

  if (SourceTypes.PVC === diskSource || SourceTypes.OTHER === diskSource) {
    return null;
  }

  if (SourceTypes.EPHEMERAL === diskSource) return <DynamicSize />;

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <CapacityInput
          isEditingCreatedDisk={isEditingCreatedDisk}
          label={t('PersistentVolumeClaim size')}
          onChange={onChange}
          size={value}
        />
      )}
      control={control}
      name={diskSizeField}
    />
  );
};

export default DiskSizeInput;
