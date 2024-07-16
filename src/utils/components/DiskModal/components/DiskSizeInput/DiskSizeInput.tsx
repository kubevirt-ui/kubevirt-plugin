import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import CapacityInput from '../../../CapacityInput/CapacityInput';
import { DiskFormState, SourceTypes } from '../../utils/types';
import { diskSizeField, diskSourceField } from '../utils/constants';

import DynamicSize from './DynamicSize';

type DiskSizeInputProps = { isEditingCreatedDisk: boolean };

const DiskSizeInput: FC<DiskSizeInputProps> = ({ isEditingCreatedDisk }) => {
  const { t } = useKubevirtTranslation();
  const { control, watch } = useFormContext<DiskFormState>();
  const diskSource = watch(diskSourceField);
  const diskSize = watch(diskSizeField);

  const emptyDiskSize = isEmpty(diskSize) || diskSize === NO_DATA_DASH;

  if (SourceTypes.PVC === diskSource || (emptyDiskSize && SourceTypes.OTHER === diskSource)) {
    return null;
  }

  if (SourceTypes.EPHEMERAL === diskSource) return <DynamicSize />;

  return (
    <Controller
      render={({ field: { onChange, value } }) => (
        <CapacityInput
          label={
            SourceTypes.OTHER === diskSource ? t('Disk size') : t('PersistentVolumeClaim size')
          }
          isEditingCreatedDisk={isEditingCreatedDisk}
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
