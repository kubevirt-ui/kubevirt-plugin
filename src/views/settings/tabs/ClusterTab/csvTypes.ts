// Extracted from types.ts
// Root: src/views/clusteroverview/utils/types.ts

import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { type APIServiceDefinition, type CRDDescription } from './descriptorTypes';

export enum InstallModeType {
  InstallModeTypeAllNamespaces = 'AllNamespaces',
  InstallModeTypeMultiNamespace = 'MultiNamespace',
  InstallModeTypeOwnNamespace = 'OwnNamespace',
  InstallModeTypeSingleNamespace = 'SingleNamespace',
}

export type ClusterServiceVersionIcon = { base64data: string; mediatype: string };

export enum ClusterServiceVersionPhase {
  CSVPhaseDeleting = 'Deleting',
  CSVPhaseFailed = 'Failed',
  CSVPhaseInstalling = 'Installing',
  CSVPhaseInstallReady = 'InstallReady',
  CSVPhaseNone = '',
  CSVPhasePending = 'Pending',
  CSVPhaseReplacing = 'Replacing',
  CSVPhaseSucceeded = 'Succeeded',
  CSVPhaseUnknown = 'Unknown',
}

export enum CSVConditionReason {
  CSVReasonBeingReplaced = 'BeingReplaced',
  CSVReasonComponentFailed = 'InstallComponentFailed',
  CSVReasonComponentUnhealthy = 'ComponentUnhealthy',
  CSVReasonCopied = 'Copied',
  CSVReasonInstallCheckFailed = 'InstallCheckFailed',
  CSVReasonInstallSuccessful = 'InstallSucceeded',
  CSVReasonInvalidStrategy = 'InvalidInstallStrategy',
  CSVReasonOwnerConflict = 'OwnerConflict',
  CSVReasonReplaced = 'Replaced',
  CSVReasonRequirementsMet = 'AllRequirementsMet',
  CSVReasonRequirementsNotMet = 'RequirementsNotMet',
  CSVReasonRequirementsUnknown = 'RequirementsUnknown',
  CSVReasonWaiting = 'InstallWaiting',
}

export type RequirementStatus = {
  group: string;
  kind: string;
  name: string;
  status: string;
  uuid?: string;
  version: string;
};

export type K8sResourceKind = K8sResourceCommon & {
  data?: Record<string, unknown>;
  spec?: Record<string, unknown>;
  status?: Record<string, unknown>;
};

export type ClusterServiceVersionKind = {
  apiVersion: 'operators.coreos.com/v1alpha1';
  kind: 'ClusterServiceVersion';
  spec: {
    apiservicedefinitions?: { owned?: APIServiceDefinition[]; required?: APIServiceDefinition[] };
    customresourcedefinitions?: { owned?: CRDDescription[]; required?: CRDDescription[] };
    description?: string;
    displayName?: string;
    icon?: ClusterServiceVersionIcon[];
    install: {
      spec: {
        deployments: { name: string; spec: unknown }[];
        permissions: {
          rules: { apiGroups: string[]; resources: string[]; verbs: string[] }[];
          serviceAccountName: string;
        }[];
      };
      strategy: 'Deployment';
    };
    installModes: { supported: boolean; type: InstallModeType }[];
    provider?: { name: string };
    relatedImages: { image: string; name: string }[];
    replaces?: string;
    version?: string;
  };
  status?: {
    phase: ClusterServiceVersionPhase;
    reason: CSVConditionReason;
    requirementStatus?: RequirementStatus[];
  };
} & K8sResourceKind;
