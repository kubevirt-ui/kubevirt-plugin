import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from 'react';

import { ClaimPropertySets } from '@kubevirt-utils/types/storage';

import {
  claimPropertySetsToCapabilities,
  mergeProfileDerivedCapabilities,
  stripProfileDerivedCapabilities,
} from '../../utils';

import { buildStorageProfileDerivedKey } from './utils';

/**
 * Keeps the storage capabilities selection in sync with the StorageProfile for
 * the currently effective storage class.
 *
 * When a StorageProfile with `claimPropertySets` is available, the
 * profile-derived access/volume-mode capabilities are merged into the current
 * selection (preserving manual flags such as snapshots). When the profile is
 * missing or empty, any previously profile-derived flags are stripped while
 * manual selections are kept.
 */
const useStorageProfileCapabilitiesSync = (
  effectiveStorageClass: string,
  claimPropertySets: ClaimPropertySets | null | undefined,
  storageProfileLoaded: boolean,
  setStorageCapabilities: Dispatch<SetStateAction<string[]>>,
): void => {
  const storageProfileDerivedKey = useMemo(
    () => buildStorageProfileDerivedKey(effectiveStorageClass, claimPropertySets),
    [effectiveStorageClass, claimPropertySets],
  );

  const prevKeyRef = useRef<string>();

  useEffect(() => {
    if (!effectiveStorageClass) {
      prevKeyRef.current = undefined;
      setStorageCapabilities((prev) => stripProfileDerivedCapabilities(prev));
    }
  }, [effectiveStorageClass, setStorageCapabilities]);

  useEffect(() => {
    if (!storageProfileLoaded || !effectiveStorageClass || !storageProfileDerivedKey) return;
    if (prevKeyRef.current === storageProfileDerivedKey) return;

    prevKeyRef.current = storageProfileDerivedKey;

    const derivedFromProfile = claimPropertySetsToCapabilities(claimPropertySets ?? undefined);

    if (claimPropertySets?.length) {
      setStorageCapabilities((prev) => mergeProfileDerivedCapabilities(prev, derivedFromProfile));
    } else {
      setStorageCapabilities((prev) => stripProfileDerivedCapabilities(prev));
    }
  }, [
    claimPropertySets,
    effectiveStorageClass,
    setStorageCapabilities,
    storageProfileDerivedKey,
    storageProfileLoaded,
  ]);
};

export default useStorageProfileCapabilitiesSync;
