/**
 * Lightweight TypeScript interfaces for OpenShift CRDs used in CI scripts.
 * Only the fields actually read/written are defined.
 */

import type { V1ObjectMeta } from '@kubernetes/client-node';

// --- Routes ---

export type Route = {
  apiVersion: 'route.openshift.io/v1';
  kind: 'Route';
  metadata: V1ObjectMeta;
  spec: {
    host?: string;
    port?: { targetPort: number | string };
    tls?: { termination: string };
    to: { kind: string; name: string };
  };
  status?: {
    ingress?: Array<{
      conditions?: Array<{ status: string; type: string }>;
      host: string;
    }>;
  };
};

// --- OAuth ---

export type OAuthClient = {
  apiVersion: 'oauth.openshift.io/v1';
  grantMethod?: string;
  kind: 'OAuthClient';
  metadata: V1ObjectMeta;
  redirectURIs?: string[];
  secret?: string;
};

// --- Console ---

export type ConsolePlugin = {
  apiVersion: 'console.openshift.io/v1' | 'console.openshift.io/v1alpha1';
  kind: 'ConsolePlugin';
  metadata: V1ObjectMeta;
  spec: {
    displayName: string;
    service: {
      basePath?: string;
      name: string;
      namespace: string;
      port: number;
    };
  };
};

// --- Cluster Config ---

export type ClusterVersion = {
  apiVersion: 'config.openshift.io/v1';
  kind: 'ClusterVersion';
  metadata: V1ObjectMeta;
  spec: { clusterID?: string };
  status?: {
    conditions?: Array<{ message?: string; status: string; type: string }>;
    desired?: { image: string; version: string };
    history?: Array<{ completionTime?: string; state: string; version: string }>;
  };
};

export type IngressConfig = {
  apiVersion: 'config.openshift.io/v1';
  kind: 'Ingress';
  metadata: V1ObjectMeta;
  spec: {
    appsDomain?: string;
    domain?: string;
  };
};

// --- SecurityContextConstraints ---

export type SecurityContextConstraints = {
  allowHostDirVolumePlugin?: boolean;
  allowHostNetwork?: boolean;
  allowHostPID?: boolean;
  allowPrivilegedContainer?: boolean;
  apiVersion: 'security.openshift.io/v1';
  kind: 'SecurityContextConstraints';
  metadata: V1ObjectMeta;
  runAsUser?: { type: string };
};
