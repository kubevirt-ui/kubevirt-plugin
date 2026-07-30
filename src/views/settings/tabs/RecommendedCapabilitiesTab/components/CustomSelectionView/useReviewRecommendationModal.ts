import { useState } from 'react';

import { type AutopilotStatusMap, type CapabilityFeature } from '../../utils/types';
import { getRegistryEntryByPackageName } from '../../utils/autopilotUtils';

type UseReviewRecommendationModalReturn = {
  onCloseReviewModal: () => void;
  onOpenReviewModal: (packageName: string) => void;
  reviewAutopilotStatus: AutopilotStatusMap[string] | undefined;
  reviewOperatorDisplayName: string;
  reviewRegistryEntry: ReturnType<typeof getRegistryEntryByPackageName>;
};

const useReviewRecommendationModal = (
  autopilotFeatures: CapabilityFeature[],
  autopilotStatusMap: AutopilotStatusMap,
): UseReviewRecommendationModalReturn => {
  const [reviewModalPackageName, setReviewModalPackageName] = useState<string | null>(null);

  const reviewRegistryEntry = reviewModalPackageName
    ? getRegistryEntryByPackageName(reviewModalPackageName)
    : undefined;

  const reviewAutopilotStatus = reviewModalPackageName
    ? autopilotStatusMap[reviewModalPackageName]
    : undefined;

  const reviewOperatorDisplayName = reviewModalPackageName
    ? (autopilotFeatures
        .flatMap((feature) => feature.operators)
        .find((operator) => operator.packageName === reviewModalPackageName)?.displayName ??
      reviewModalPackageName)
    : '';

  return {
    onCloseReviewModal: () => setReviewModalPackageName(null),
    onOpenReviewModal: setReviewModalPackageName,
    reviewAutopilotStatus,
    reviewOperatorDisplayName,
    reviewRegistryEntry,
  };
};

export default useReviewRecommendationModal;
