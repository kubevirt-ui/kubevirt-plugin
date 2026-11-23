import { getVisibleRedHatInstanceTypeSeriesItems } from '../getVisibleRedHatInstanceTypeSeriesItems';
import { isInstanceTypeFamilyVisible } from '../utils';

const items = [
  { classDisplayNameAnnotation: 'Memory Optimized', seriesName: 'm1' },
  { classDisplayNameAnnotation: 'Compute Exclusive', seriesName: 'cx1' },
  { classDisplayNameAnnotation: 'General Purpose', seriesName: 'u1' },
];

describe('getVisibleRedHatInstanceTypeSeriesItems', () => {
  it('sorts items by display name', () => {
    const result = getVisibleRedHatInstanceTypeSeriesItems(items, () => true);

    expect(result.map((item) => item.seriesName)).toEqual(['cx1', 'u1', 'm1']);
  });

  it('does not mutate the input list', () => {
    const copy = [...items];
    getVisibleRedHatInstanceTypeSeriesItems(items, () => true);

    expect(items).toEqual(copy);
  });

  it('filters out families that are not visible', () => {
    const disabled = new Set(['cx1']);
    const result = getVisibleRedHatInstanceTypeSeriesItems(items, (series, preserve) =>
      isInstanceTypeFamilyVisible(series, disabled, preserve),
    );

    expect(result.map((item) => item.seriesName)).toEqual(['u1', 'm1']);
  });

  it('keeps the preserved family even when it is disabled', () => {
    const disabled = new Set(['cx1']);
    const result = getVisibleRedHatInstanceTypeSeriesItems(
      items,
      (series, preserve) => isInstanceTypeFamilyVisible(series, disabled, preserve),
      'cx1',
    );

    expect(result.map((item) => item.seriesName)).toEqual(['cx1', 'u1', 'm1']);
  });
});
