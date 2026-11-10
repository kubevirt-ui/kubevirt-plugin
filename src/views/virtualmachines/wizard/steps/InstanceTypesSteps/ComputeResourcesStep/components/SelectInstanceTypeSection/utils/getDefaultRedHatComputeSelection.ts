import { type RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import {
  is1GiInstanceType,
  seriesHasHugepagesVariant,
} from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import { type InstanceTypeSelection } from '@virtualmachines/wizard/form/types';

export const getDefaultRedHatComputeSelection = ({
  seriesName,
  sizes,
}: RedHatInstanceTypeSeries): InstanceTypeSelection => {
  const standardSizes = seriesHasHugepagesVariant(seriesName)
    ? sizes?.filter((size) => !is1GiInstanceType(size.sizeLabel))
    : sizes;
  const defaultSize = (standardSizes?.[0] ?? sizes?.[0])?.sizeLabel ?? '';

  return {
    name: defaultSize ? `${seriesName}.${defaultSize}` : seriesName,
    series: seriesName,
    size: defaultSize,
    type: 'redhat',
  };
};
