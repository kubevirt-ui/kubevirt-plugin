import {
  produceCdromUploadVolumeState,
  produceEmptyDriveData,
  produceExistingISOData,
} from './cdromDataProducers';
import type { V1DiskFormState } from './types';

const DISK_NAME = 'cdrom-1';
const DV_NAME = 'cdrom-1-upload-blue-cat-01';
const ISO_CLAIM = 'existing-iso';

const buildData = (overrides: Partial<V1DiskFormState> = {}): V1DiskFormState => ({
  dataVolumeTemplate: {
    metadata: { name: DV_NAME },
    spec: { source: { upload: {} }, storage: { resources: { requests: { storage: '10Gi' } } } },
  },
  disk: { cdrom: {}, name: DISK_NAME },
  isBootSource: false,
  volume: { dataVolume: { name: DV_NAME }, name: DISK_NAME },
  ...overrides,
});

describe('produceCdromUploadVolumeState', () => {
  it('uses a dataVolume ref for a running hot-pluggable VM', () => {
    const result = produceCdromUploadVolumeState(buildData(), DISK_NAME, true, true);

    expect(result.dataVolumeTemplate).toBeUndefined();
    expect(result.volume).toEqual({
      dataVolume: { hotpluggable: true, name: DV_NAME },
      name: DISK_NAME,
    });
  });

  it('uses a PVC claim for a stopped VM', () => {
    const result = produceCdromUploadVolumeState(buildData(), DISK_NAME, true, false);

    expect(result.dataVolumeTemplate).toBeUndefined();
    expect(result.volume).toEqual({
      name: DISK_NAME,
      persistentVolumeClaim: { claimName: DV_NAME, hotpluggable: true },
    });
  });

  it('uses a PVC claim without hotpluggable when hotplug is disabled', () => {
    const result = produceCdromUploadVolumeState(buildData(), DISK_NAME, false, true);

    expect(result.volume).toEqual({
      name: DISK_NAME,
      persistentVolumeClaim: { claimName: DV_NAME },
    });
  });

  it('prefers an explicit DataVolume name over the form template name', () => {
    const result = produceCdromUploadVolumeState(buildData(), DISK_NAME, true, true, 'explicit-dv');

    expect(result.volume?.dataVolume?.name).toBe('explicit-dv');
  });

  it('leaves the form state unchanged when no DataVolume name is available', () => {
    const data = buildData({ dataVolumeTemplate: undefined, volume: { name: DISK_NAME } });

    expect(produceCdromUploadVolumeState(data, DISK_NAME, true, true)).toEqual(data);
  });
});

describe('produceExistingISOData', () => {
  it('points the volume at the selected ISO claim', () => {
    const result = produceExistingISOData(buildData(), ISO_CLAIM, true);

    expect(result.dataVolumeTemplate).toBeUndefined();
    expect(result.volume?.persistentVolumeClaim).toEqual({
      claimName: ISO_CLAIM,
      hotpluggable: true,
    });
  });
});

describe('produceEmptyDriveData', () => {
  it('removes the volume and DataVolume template', () => {
    const result = produceEmptyDriveData(buildData());

    expect(result.dataVolumeTemplate).toBeUndefined();
    expect(result.volume).toBeUndefined();
  });
});
