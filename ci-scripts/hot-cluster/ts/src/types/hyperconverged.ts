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
      lastTransitionTime?: string;
      message?: string;
      reason?: string;
      status: string;
      type: string;
    }>;
    observedGeneration?: number;
    versions?: Array<{ name: string; version: string }>;
  };
};

export type KubeVirt = {
  apiVersion: 'kubevirt.io/v1';
  kind: 'KubeVirt';
  metadata: V1ObjectMeta;
  status?: {
    conditions?: Array<{ status: string; type: string }>;
    observedKubeVirtVersion?: string;
    phase?: string;
  };
};

export type CDI = {
  apiVersion: 'cdi.kubevirt.io/v1beta1';
  kind: 'CDI';
  metadata: V1ObjectMeta;
  status?: {
    conditions?: Array<{ status: string; type: string }>;
    observedVersion?: string;
    phase?: string;
  };
};

export type SSP = {
  apiVersion: 'ssp.kubevirt.io/v1beta2';
  kind: 'SSP';
  metadata: V1ObjectMeta;
  status?: {
    conditions?: Array<{ status: string; type: string }>;
    observedVersion?: string;
    phase?: string;
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
    conditions?: Array<{ status: string; type: string }>;
    observedVersion?: string;
  };
};
