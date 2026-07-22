/**
 * HyperConverged and related KubeVirt operator CRD types.
 */

import type { V1ObjectMeta } from '@kubernetes/client-node';

export type HyperConverged = {
  apiVersion: 'hco.kubevirt.io/v1beta1';
  kind: 'HyperConverged';
  metadata: V1ObjectMeta;
  spec: Record<string, unknown>;
  status?: {
    conditions?: Array<{
      type: string;
      status: string;
      reason?: string;
      message?: string;
      lastTransitionTime?: string;
    }>;
    versions?: Array<{ name: string; version: string }>;
    observedGeneration?: number;
  };
};

export type KubeVirt = {
  apiVersion: 'kubevirt.io/v1';
  kind: 'KubeVirt';
  metadata: V1ObjectMeta;
  status?: {
    observedKubeVirtVersion?: string;
    phase?: string;
    conditions?: Array<{ type: string; status: string }>;
  };
};

export type CDI = {
  apiVersion: 'cdi.kubevirt.io/v1beta1';
  kind: 'CDI';
  metadata: V1ObjectMeta;
  status?: {
    observedVersion?: string;
    phase?: string;
    conditions?: Array<{ type: string; status: string }>;
  };
};

export type SSP = {
  apiVersion: 'ssp.kubevirt.io/v1beta2';
  kind: 'SSP';
  metadata: V1ObjectMeta;
  status?: {
    observedVersion?: string;
    phase?: string;
    conditions?: Array<{ type: string; status: string }>;
  };
};

export type HostPathProvisioner = {
  apiVersion: 'hostpathprovisioner.kubevirt.io/v1beta1';
  kind: 'HostPathProvisioner';
  metadata: V1ObjectMeta;
  spec: {
    imagePullPolicy?: string;
    pathConfig?: { path: string; useNamingPrefix?: boolean };
  };
  status?: {
    observedVersion?: string;
    conditions?: Array<{ type: string; status: string }>;
  };
};
