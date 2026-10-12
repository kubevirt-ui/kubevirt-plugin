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
    installPlanApproval?: 'Automatic' | 'Manual';
    name: string;
    source: string;
    sourceNamespace: string;
    startingCSV?: string;
  };
  status?: {
    conditions?: Array<{ message?: string; status: string; type: string }>;
    currentCSV?: string;
    installedCSV?: string;
    installPlanRef?: { name: string; namespace: string };
    state?: string;
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
    conditions?: Array<{ message?: string; status: string; type: string }>;
    phase?: 'Complete' | 'Failed' | 'Installing' | 'RequiresApproval';
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
      currentCSV: string;
      currentCSVDesc?: {
        displayName?: string;
        version?: string;
      };
      name: string;
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
    conditions?: Array<{ message?: string; status: string; type: string }>;
    phase?: 'Failed' | 'Installing' | 'Pending' | 'Succeeded';
  };
};
