import { type RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { INSTANCE_TYPE_SERIES } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/constants';
import { getVisibleRedHatInstanceTypeSeriesItems } from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/getVisibleRedHatInstanceTypeSeriesItems';

export const pickDefaultRedHatInstanceTypeSeries = (
  items: RedHatInstanceTypeSeries[],
  isFamilyVisible: (series: string, preserveFamily?: string) => boolean,
): RedHatInstanceTypeSeries | undefined => {
  const visibleBySeries = new Map(
    getVisibleRedHatInstanceTypeSeriesItems(items, isFamilyVisible).map((item) => [
      item.seriesName,
      item,
    ]),
  );

  return INSTANCE_TYPE_SERIES.map((seriesName) => visibleBySeries.get(seriesName)).find(Boolean);
};
