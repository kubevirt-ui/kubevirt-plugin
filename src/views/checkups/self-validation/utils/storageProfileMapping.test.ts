import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import {
  STORAGE_CAPABILITY_STORAGE_RWO_BLOCK,
  STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM,
  STORAGE_CAPABILITY_STORAGE_RWX_BLOCK,
  STORAGE_CAPABILITY_STORAGE_RWX_FILESYSTEM,
  STORAGE_CAPABILITY_STORAGE_SNAPSHOT,
} from './constants';
import {
  claimPropertySetsToCapabilities,
  mergeProfileDerivedCapabilities,
  stripProfileDerivedCapabilities,
} from './storageProfileMapping';

describe('claimPropertySetsToCapabilities', () => {
  it('should return empty array for null or empty claimPropertySets', () => {
    expect(claimPropertySetsToCapabilities(null)).toEqual([]);
    expect(claimPropertySetsToCapabilities(undefined)).toEqual([]);
    expect(claimPropertySetsToCapabilities([])).toEqual([]);
  });

  it('should map RWX Block and RWO Filesystem combinations', () => {
    const caps = claimPropertySetsToCapabilities([
      {
        accessModes: [V1beta1StorageSpecAccessModesEnum.ReadWriteMany],
        volumeMode: V1beta1StorageSpecVolumeModeEnum.Block,
      },
      {
        accessModes: [V1beta1StorageSpecAccessModesEnum.ReadWriteOnce],
        volumeMode: V1beta1StorageSpecVolumeModeEnum.Filesystem,
      },
    ]);

    expect(caps).toEqual(
      expect.arrayContaining([
        STORAGE_CAPABILITY_STORAGE_RWX_BLOCK,
        STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM,
      ]),
    );
    expect(caps).toHaveLength(2);
  });

  it('should deduplicate capabilities across claim property sets', () => {
    const caps = claimPropertySetsToCapabilities([
      {
        accessModes: [
          V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
          V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
        ],
        volumeMode: V1beta1StorageSpecVolumeModeEnum.Block,
      },
    ]);

    expect(caps).toEqual([STORAGE_CAPABILITY_STORAGE_RWO_BLOCK]);
  });
});

describe('mergeProfileDerivedCapabilities', () => {
  it('should merge derived flags with manual selections', () => {
    const merged = mergeProfileDerivedCapabilities(
      [STORAGE_CAPABILITY_STORAGE_RWX_BLOCK, STORAGE_CAPABILITY_STORAGE_SNAPSHOT],
      [STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM],
    );

    expect(merged).toEqual(
      expect.arrayContaining([
        STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM,
        STORAGE_CAPABILITY_STORAGE_SNAPSHOT,
      ]),
    );
    expect(merged).toHaveLength(2);
  });
});

describe('stripProfileDerivedCapabilities', () => {
  it('should remove only profile-derived capability flags', () => {
    expect(
      stripProfileDerivedCapabilities([
        STORAGE_CAPABILITY_STORAGE_RWX_FILESYSTEM,
        STORAGE_CAPABILITY_STORAGE_SNAPSHOT,
      ]),
    ).toEqual([STORAGE_CAPABILITY_STORAGE_SNAPSHOT]);
  });
});
