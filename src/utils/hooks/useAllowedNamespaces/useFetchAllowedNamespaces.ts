import { useEffect } from 'react';

import { useSignals } from '@preact/signals-react/runtime';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import {
  getAllowedNamespacesFetchResult,
  releaseAllowedNamespacesFetch,
  retainAllowedNamespacesFetch,
} from './allowedNamespacesFetchSignal';
import { type UseFetchAllowedNamespacesResult } from './types';

export type { UseFetchAllowedNamespacesResult };

const useFetchAllowedNamespaces = (
  accessReview: FleetAccessReviewResourceAttributes | null,
): UseFetchAllowedNamespacesResult => {
  useSignals();

  useEffect(() => {
    if (!accessReview) {
      return;
    }

    retainAllowedNamespacesFetch(accessReview);

    return (): void => {
      releaseAllowedNamespacesFetch(accessReview);
    };
  }, [accessReview]);

  return getAllowedNamespacesFetchResult(accessReview);
};

export default useFetchAllowedNamespaces;
