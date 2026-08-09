import { useCallback, useEffect, useRef, useState } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';

import { OLM_PROCESSING_DELAY_MS } from '../utils/constants';
import { InstallState } from '../utils/types';
import { type RecommendedCapabilityDetailsMap } from '../utils/types';

type UseAwaitingOLMReturn = {
  awaitingOLMFeatures: Set<string>;
  markAwaitingOLM: (featureId: string) => void;
};

const useAwaitingOLM = (
  detailsMap: RecommendedCapabilityDetailsMap,
  getFeaturePackageNames: (featureId: string) => string[],
): UseAwaitingOLMReturn => {
  const [awaitingOLMFeatures, setAwaitingOLMFeatures] = useState<Set<string>>(() => new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (isEmpty(awaitingOLMFeatures)) return;

    const resolved = [...awaitingOLMFeatures].filter((featureId) =>
      getFeaturePackageNames(featureId).some(
        (packageName) => detailsMap[packageName]?.installState === InstallState.INSTALLING,
      ),
    );
    if (isEmpty(resolved)) return;

    setAwaitingOLMFeatures((prev) => {
      const next = new Set(prev);
      for (const id of resolved) next.delete(id);
      return next;
    });
    for (const id of resolved) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
  }, [awaitingOLMFeatures, detailsMap, getFeaturePackageNames]);

  useEffect(
    () => (): void => {
      for (const timer of timersRef.current.values()) clearTimeout(timer);
    },
    [],
  );

  const markAwaitingOLM = useCallback((featureId: string) => {
    setAwaitingOLMFeatures((prev) => new Set(prev).add(featureId));

    const timer = setTimeout(() => {
      setAwaitingOLMFeatures((prev) => {
        const next = new Set(prev);
        next.delete(featureId);
        return next;
      });
      timersRef.current.delete(featureId);
    }, OLM_PROCESSING_DELAY_MS);

    timersRef.current.set(featureId, timer);
  }, []);

  return { awaitingOLMFeatures, markAwaitingOLM };
};

export default useAwaitingOLM;
