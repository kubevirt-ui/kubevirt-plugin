import { useCallback, useEffect, useRef, useState } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { InstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';

import { OLM_PROCESSING_DELAY_MS } from '../utils/constants';
import { type RecommendedCapabilityDetailsMap } from '../utils/types';

type UseAwaitingOLMReturn = {
  awaitingOLMFeatures: Set<string>;
  markAwaitingOLM: (featureId: string) => void;
};

const useAwaitingOLM = (
  detailsMap: RecommendedCapabilityDetailsMap,
  getFeaturePackageNames: (featureId: string) => string[],
): UseAwaitingOLMReturn => {
  const [awaitingOLMFeatures, setAwaitingOLMFeatures] = useState<Set<string>>(new Set());
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
      resolved.forEach((id) => next.delete(id));
      return next;
    });
    resolved.forEach((id) => {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    });
  }, [awaitingOLMFeatures, detailsMap, getFeaturePackageNames]);

  useEffect(() => () => timersRef.current.forEach((timer) => clearTimeout(timer)), []);

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
