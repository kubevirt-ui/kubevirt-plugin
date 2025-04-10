import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import {
  getUnitFromSize,
  getValueFromSize,
  removeByteSuffix,
} from '@kubevirt-utils/components/CapacityInput/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { V1DiskFormState } from '../../utils/types';
import { EXPAND_PVC_SIZE } from '../utils/constants';

import usePVCDefaultSize from './usePVCDefaultSize';

type ExpandPVCProps = { pvc: IoK8sApiCoreV1PersistentVolumeClaim };

const ExpandPVC: FC<ExpandPVCProps> = ({ pvc }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, watch } = useFormContext<V1DiskFormState>();
  const diskState = watch();

  const expandPVCSize = diskState.expandPVCSize;

  const pvcSize = pvc?.spec?.resources?.requests?.storage;
  const { minSizes, selectedUnit, setSelectedUnit } = usePVCDefaultSize(pvcSize);

  const onQuantityChange = (quantity: string) => {
    const newUnit = getUnitFromSize(quantity);

    if (newUnit !== selectedUnit) {
      setSelectedUnit(newUnit);

      const newSize = minSizes[newUnit];
      if (newSize.value > getValueFromSize(quantity)) {
        const newPvcSize = `${Math.ceil(newSize.value)}${removeByteSuffix(newSize.unit)}`;

        setValue(EXPAND_PVC_SIZE, newPvcSize);
        return;
      }
    }

    setValue(EXPAND_PVC_SIZE, quantity);
  };

  if (!pvcSize) return null;

  const minSize = minSizes[selectedUnit];
  const size = expandPVCSize || minSize.string;

  const isMinusDisabled =
    Math.ceil(minSize.value) >= getValueFromSize(expandPVCSize) || !expandPVCSize;

  return (
    <CapacityInput
      isMinusDisabled={isMinusDisabled}
      label={t('PersistentVolumeClaim size')}
      minValue={minSize.value}
      onChange={onQuantityChange}
      size={size}
    />
  );
};

export default ExpandPVC;
