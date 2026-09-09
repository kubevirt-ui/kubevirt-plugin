// Extracted from types.ts
// Root: src/views/clusteroverview/utils/types.ts

import { type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1Condition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { type K8sResourceKind } from './csvTypes';

export enum InstallPlanApproval {
  Automatic = 'Automatic',
  Manual = 'Manual',
}

export type ObjectReference = {
  apiVersion?: string;
  fieldPath?: string;
  kind?: string;
  name?: string;
  namespace?: string;
  resourceVersion?: string;
  uid?: string;
};

export enum SubscriptionState {
  SubscriptionStateAtLatest = 'AtLatestKnown',
  SubscriptionStateFailed = 'UpgradeFailed',
  SubscriptionStateNone = '',
  SubscriptionStateUpgradeAvailable = 'UpgradeAvailable',
  SubscriptionStateUpgradePending = 'UpgradePending',
}

export type SubscriptionKind = {
  apiVersion: 'operators.coreos.com/v1alpha1';
  kind: 'Subscription';
  spec: {
    channel?: string;
    installPlanApproval?: InstallPlanApproval;
    name: string;
    source: string;
    sourceNamespace?: string;
    startingCSV?: string;
  };
  status?: {
    catalogHealth?: {
      catalogSourceRef?: ObjectReference;
      healthy?: boolean;
      lastUpdated?: string;
    }[];
    conditions?: V1Condition[];
    currentCSV?: string;
    installedCSV?: string;
    installPlanRef?: ObjectReference;
    lastUpdated?: string;
    state?: SubscriptionState;
  };
} & K8sResourceCommon;

export type CatalogSourceKind = {
  apiVersion: 'operators.coreos.com/v1alpha1';
  kind: 'CatalogSource';
  spec: {
    configMap?: string;
    description?: string;
    displayName?: string;
    icon?: { data: string; mediatype: string };
    name: string;
    publisher?: string;
    secrets?: string[];
    sourceType: 'configMap' | 'grpc' | 'internal';
    updateStrategy?: { registryPoll: { interval: string } };
  };
} & K8sResourceKind;

export type TemplateList = K8sResourceCommon & {
  items: V1Template[];
};

export type { OperatorGroupKind } from './operatorGroupTypes';
export type { PackageManifestKind } from './packageManifestTypes';
