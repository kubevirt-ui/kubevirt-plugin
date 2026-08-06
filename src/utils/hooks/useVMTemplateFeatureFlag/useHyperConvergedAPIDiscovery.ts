import { useEffect } from 'react';

import { hyperConvergedBaseModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  getHCOAPIDiscoveryEntry,
  setHCOAPIDiscoveryEntry,
} from '@kubevirt-utils/store/hcoAPIDiscovery';
import useK8sBaseAPIPath from '@multicluster/hooks/useK8sBaseAPIPath';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { useSignals } from '@preact/signals-react/runtime';

type APIGroupDiscovery = {
  preferredVersion?: { version?: string };
};

type HyperConvergedAPIDiscovery = {
  loading: boolean;
  preferredVersion: string | undefined;
};

type UseHyperConvergedAPIDiscovery = (cluster?: string) => HyperConvergedAPIDiscovery;

/**
 * Fetches Kubernetes API discovery for the HCO API group on a managed cluster
 * (`GET {apiPath}/apis/hco.kubevirt.io`) and returns the preferred version.
 * Results are cached in a signal keyed by cluster so multiple hook instances
 * share a single request. Pass undefined cluster to skip the fetch.
 */
const useHyperConvergedAPIDiscovery: UseHyperConvergedAPIDiscovery = (cluster) => {
  useSignals();
  const [apiPath, apiPathLoaded] = useK8sBaseAPIPath(cluster);
  const entry = cluster ? getHCOAPIDiscoveryEntry(cluster) : undefined;

  useEffect(() => {
    // Re-read the cache inside the effect so concurrent mounts in the same
    // commit do not each start a discovery request.
    if (!cluster || getHCOAPIDiscoveryEntry(cluster) || !apiPathLoaded || !apiPath) {
      return undefined;
    }

    setHCOAPIDiscoveryEntry(cluster, { loading: true, preferredVersion: undefined });

    const discoveryURL = `${apiPath}/apis/${hyperConvergedBaseModel.apiGroup}`;

    consoleFetchJSON(discoveryURL)
      .then((apiGroup: APIGroupDiscovery) => {
        setHCOAPIDiscoveryEntry(cluster, {
          loading: false,
          preferredVersion: apiGroup?.preferredVersion?.version,
        });
      })
      .catch(() => {
        setHCOAPIDiscoveryEntry(cluster, { loading: false, preferredVersion: undefined });
      });

    return undefined;
  }, [apiPath, apiPathLoaded, cluster, entry]);

  if (!cluster) {
    return { loading: false, preferredVersion: undefined };
  }

  return entry ?? { loading: true, preferredVersion: undefined };
};

export default useHyperConvergedAPIDiscovery;
