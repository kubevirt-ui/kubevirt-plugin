import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { formatQuantityString, quantityToString, toQuantity } from '@kubevirt-utils/utils/units';

import { V1DiskFormState } from '../../utils/types';
import { EXPAND_PVC_SIZE } from '../utils/constants';

import { getMinSizes, getPVCStorageForInput } from './utils';

type ExpandPVCProps = { pvc: IoK8sApiCoreV1PersistentVolumeClaim };

const ExpandPVC: FC<ExpandPVCProps> = ({ pvc }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, watch } = useFormContext<V1DiskFormState>();
  const diskState = watch();

  const expandPVCSize = diskState.expandPVCSize;
  const pvcStorage = formatQuantityString(getPVCStorageForInput(pvc));
  if (!pvcStorage) {
    return null;
  }

  const size = expandPVCSize ?? pvcStorage;
  const { unit, value } = toQuantity(size);

  const minSizes = getMinSizes(pvcStorage);

  const onQuantityChange = (quantityString: string) => {
    const { unit: newUnit, value: newValue } = toQuantity(quantityString);

    // unit has changed -> adjust size to be bigger than minimal size for that unit
    if (newUnit !== unit) {
      const minSize = minSizes[newUnit];

      if (minSize > newValue) {
        const newPvcSize = quantityToString({ unit: newUnit, value: Math.ceil(minSize) });

        setValue(EXPAND_PVC_SIZE, newPvcSize);
        return;
      }
    }

    setValue(EXPAND_PVC_SIZE, quantityString);
  };

  const minSize = minSizes[unit];
  const isMinusDisabled = Math.ceil(minSize) >= value;

  return (
    <CapacityInput
      isMinusDisabled={isMinusDisabled}
      label={t('PersistentVolumeClaim size')}
      minValue={minSize}
      onChange={onQuantityChange}
      size={size}
    />
  );
};

export default ExpandPVC;
