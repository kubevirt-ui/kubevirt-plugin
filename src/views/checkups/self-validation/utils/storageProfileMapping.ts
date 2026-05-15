import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';

import {
  STORAGE_CAPABILITY_STORAGE_RWO_BLOCK,
  STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM,
  STORAGE_CAPABILITY_STORAGE_RWX_BLOCK,
  STORAGE_CAPABILITY_STORAGE_RWX_FILESYSTEM,
} from './constants';

/** Capability flags that can be inferred from StorageProfile claimPropertySets */
export const STORAGE_CAPABILITIES_FROM_PROFILE = new Set<string>([
  STORAGE_CAPABILITY_STORAGE_RWX_BLOCK,
  STORAGE_CAPABILITY_STORAGE_RWX_FILESYSTEM,
  STORAGE_CAPABILITY_STORAGE_RWO_BLOCK,
  STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM,
]);

const mapAccessModeAndVolumeModeToCapability = (
  accessMode: V1beta1StorageSpecAccessModesEnum,
  volumeMode: string | undefined,
): null | string => {
  if (!volumeMode) {
    return null;
  }

  const normalizedVolumeMode = volumeMode as V1beta1StorageSpecVolumeModeEnum;

  if (accessMode === V1beta1StorageSpecAccessModesEnum.ReadWriteMany) {
    if (normalizedVolumeMode === V1beta1StorageSpecVolumeModeEnum.Block) {
      return STORAGE_CAPABILITY_STORAGE_RWX_BLOCK;
    }
    if (normalizedVolumeMode === V1beta1StorageSpecVolumeModeEnum.Filesystem) {
      return STORAGE_CAPABILITY_STORAGE_RWX_FILESYSTEM;
    }
  }

  if (accessMode === V1beta1StorageSpecAccessModesEnum.ReadWriteOnce) {
    if (normalizedVolumeMode === V1beta1StorageSpecVolumeModeEnum.Block) {
      return STORAGE_CAPABILITY_STORAGE_RWO_BLOCK;
    }
    if (normalizedVolumeMode === V1beta1StorageSpecVolumeModeEnum.Filesystem) {
      return STORAGE_CAPABILITY_STORAGE_RWO_FILESYSTEM;
    }
  }

  return null;
};

/**
 * Maps StorageProfile status.claimPropertySets to self-validation STORAGE_CAPABILITIES flags.
 * Only access/volume mode combinations that exist in the profile are returned; other flags stay user-selected.
 */
export const claimPropertySetsToCapabilities = (
  claimPropertySets: ClaimPropertySets | null | undefined,
): string[] => {
  if (!claimPropertySets?.length) {
    return [];
  }

  const capabilities = new Set<string>();

  for (const propertySet of claimPropertySets) {
    const { accessModes, volumeMode } = propertySet;
    if (!accessModes?.length) {
      continue;
    }

    for (const accessMode of accessModes) {
      const capability = mapAccessModeAndVolumeModeToCapability(accessMode, volumeMode);
      if (capability) {
        capabilities.add(capability);
      }
    }
  }

  return Array.from(capabilities);
};

/** Merge profile-derived access/volume capabilities with user-selected flags (e.g. snapshots). */
export const mergeProfileDerivedCapabilities = (
  previousCapabilities: string[],
  derivedFromProfile: string[],
): string[] => {
  const manual = previousCapabilities.filter((c) => !STORAGE_CAPABILITIES_FROM_PROFILE.has(c));
  return Array.from(new Set([...derivedFromProfile, ...manual]));
};

/** Remove only profile-derived flags; keep manual selections (snapshot, CSI, etc.). */
export const stripProfileDerivedCapabilities = (capabilities: string[]): string[] =>
  capabilities.filter((c) => !STORAGE_CAPABILITIES_FROM_PROFILE.has(c));
