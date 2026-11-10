import { universalComparator } from '@kubevirt-utils/utils/utils';

type RedHatSeriesMenuItem = {
  classDisplayNameAnnotation: string;
  seriesName: string;
};

export const getVisibleRedHatInstanceTypeSeriesItems = <T extends RedHatSeriesMenuItem>(
  items: T[],
  isFamilyVisible: (series: string, preserveFamily?: string) => boolean,
  preserveFamily?: string,
): T[] => {
  const sorted = items.toSorted((a, b) =>
    universalComparator(a.classDisplayNameAnnotation, b.classDisplayNameAnnotation),
  );
  return sorted.filter(({ seriesName }) => isFamilyVisible(seriesName, preserveFamily));
};
