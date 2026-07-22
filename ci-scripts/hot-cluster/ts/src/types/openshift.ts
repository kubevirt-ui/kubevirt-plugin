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
    to: { kind: string; name: string };
    port?: { targetPort: string | number };
    tls?: { termination: string };
  };
  status?: {
    ingress?: Array<{
      host: string;
      conditions?: Array<{ type: string; status: string }>;
    }>;
  };
};

// --- OAuth ---

export type OAuthClient = {
  apiVersion: 'oauth.openshift.io/v1';
  kind: 'OAuthClient';
  metadata: V1ObjectMeta;
  grantMethod?: string;
  secret?: string;
  redirectURIs?: string[];
};

// --- Console ---

export type ConsolePlugin = {
  apiVersion: 'console.openshift.io/v1' | 'console.openshift.io/v1alpha1';
  kind: 'ConsolePlugin';
  metadata: V1ObjectMeta;
  spec: {
    displayName: string;
    service: {
      name: string;
      namespace: string;
      port: number;
      basePath?: string;
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
    desired?: { version: string; image: string };
    history?: Array<{ version: string; state: string; completionTime?: string }>;
    conditions?: Array<{ type: string; status: string; message?: string }>;
  };
};

export type IngressConfig = {
  apiVersion: 'config.openshift.io/v1';
  kind: 'Ingress';
  metadata: V1ObjectMeta;
  spec: {
    domain?: string;
    appsDomain?: string;
  };
};

// --- SecurityContextConstraints ---

export type SecurityContextConstraints = {
  apiVersion: 'security.openshift.io/v1';
  kind: 'SecurityContextConstraints';
  metadata: V1ObjectMeta;
  allowHostDirVolumePlugin?: boolean;
  allowHostNetwork?: boolean;
  allowHostPID?: boolean;
  allowPrivilegedContainer?: boolean;
  runAsUser?: { type: string };
};
