/**
 * OLM (Operator Lifecycle Manager) CRD types used by install-hco.sh.
 */

import type { V1ObjectMeta } from '@kubernetes/client-node';

export type Subscription = {
  apiVersion: 'operators.coreos.com/v1alpha1';
  kind: 'Subscription';
  metadata: V1ObjectMeta;
  spec: {
    channel: string;
    name: string;
    source: string;
    sourceNamespace: string;
    installPlanApproval?: 'Automatic' | 'Manual';
    startingCSV?: string;
  };
  status?: {
    currentCSV?: string;
    installedCSV?: string;
    state?: string;
    installPlanRef?: { name: string; namespace: string };
    conditions?: Array<{ type: string; status: string; message?: string }>;
  };
};

export type InstallPlan = {
  apiVersion: 'operators.coreos.com/v1alpha1';
  kind: 'InstallPlan';
  metadata: V1ObjectMeta;
  spec: {
    approved: boolean;
    clusterServiceVersionNames: string[];
  };
  status?: {
    phase?: 'RequiresApproval' | 'Installing' | 'Complete' | 'Failed';
    conditions?: Array<{ type: string; status: string; message?: string }>;
  };
};

export type OperatorGroup = {
  apiVersion: 'operators.coreos.com/v1';
  kind: 'OperatorGroup';
  metadata: V1ObjectMeta;
  spec: {
    targetNamespaces?: string[];
  };
};

export type PackageManifest = {
  apiVersion: 'packages.operators.coreos.com/v1';
  kind: 'PackageManifest';
  metadata: V1ObjectMeta;
  status: {
    catalogSource: string;
    catalogSourceNamespace: string;
    channels: Array<{
      name: string;
      currentCSV: string;
      currentCSVDesc?: {
        version?: string;
        displayName?: string;
      };
    }>;
    defaultChannel: string;
    packageName: string;
  };
};

export type ClusterServiceVersion = {
  apiVersion: 'operators.coreos.com/v1alpha1';
  kind: 'ClusterServiceVersion';
  metadata: V1ObjectMeta;
  spec: {
    displayName?: string;
    version?: string;
  };
  status?: {
    phase?: 'Succeeded' | 'Failed' | 'Installing' | 'Pending';
    conditions?: Array<{ type: string; status: string; message?: string }>;
  };
};
