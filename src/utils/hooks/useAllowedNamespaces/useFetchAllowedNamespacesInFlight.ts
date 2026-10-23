import { useEffect, useState } from 'react';

import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import { fetchAllowedNamespacesInFlight } from './fetchAllowedNamespacesInFlight';
import { type AllowedNamespacesResponse } from './types';

export type UseFetchAllowedNamespacesInFlightResult = {
  data: AllowedNamespacesResponse | undefined;
  error: Error | null;
  loaded: boolean;
};

const initialState: UseFetchAllowedNamespacesInFlightResult = {
  data: undefined,
  error: null,
  loaded: false,
};

const useFetchAllowedNamespacesInFlight = (
  accessReview: FleetAccessReviewResourceAttributes | null,
  enabled: boolean,
): UseFetchAllowedNamespacesInFlightResult => {
  const [state, setState] = useState<UseFetchAllowedNamespacesInFlightResult>(initialState);

  useEffect(() => {
    if (!enabled || !accessReview) {
      setState(initialState);
      return;
    }

    let cancelled = false;
    setState({ data: undefined, error: null, loaded: false });

    void fetchAllowedNamespacesInFlight(accessReview)
      .then((data) => {
        if (!cancelled) {
          setState({ data, error: null, loaded: true });
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setState({
            data: undefined,
            error: e instanceof Error ? e : new Error(String(e)),
            loaded: true,
          });
        }
      });

    return (): void => {
      cancelled = true;
    };
  }, [accessReview, enabled]);

  return state;
};

export default useFetchAllowedNamespacesInFlight;
