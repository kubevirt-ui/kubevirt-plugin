import { type RedHatInstanceTypeSeries } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';

import { pickDefaultRedHatInstanceTypeSeries } from './pickDefaultRedHatInstanceTypeSeries';

const series = (seriesName: string): RedHatInstanceTypeSeries => ({
  classDisplayNameAnnotation: seriesName,
  descriptionAnnotation: '',
  seriesName,
  sizes: [{ sizeLabel: 'small' }],
});

describe('pickDefaultRedHatInstanceTypeSeries', () => {
  const items = [series('u1'), series('m1'), series('cx1')];

  it('prefers u1 when general purpose is available', () => {
    const isFamilyVisible = (name: string) => name !== 'cx1';

    expect(pickDefaultRedHatInstanceTypeSeries(items, isFamilyVisible)?.seriesName).toBe('u1');
  });

  it('falls back to the next available family when u1 is hidden', () => {
    const isFamilyVisible = (name: string) => name !== 'u1';

    expect(pickDefaultRedHatInstanceTypeSeries(items, isFamilyVisible)?.seriesName).toBe('m1');
  });
});
