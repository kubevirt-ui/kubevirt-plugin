import { type RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { universalComparator } from '@kubevirt-utils/utils/utils';

export const getVisibleRedHatInstanceTypeSeriesItems = (
  items: RedHatInstanceTypeSeries[],
  isFamilyVisible: (series: string, preserveFamily?: string) => boolean,
  preserveFamily?: string,
): RedHatInstanceTypeSeries[] => {
  const sorted = items.toSorted((a, b) =>
    universalComparator(a.classDisplayNameAnnotation, b.classDisplayNameAnnotation),
  );
  return sorted.filter(({ seriesName }) => isFamilyVisible(seriesName, preserveFamily));
};
