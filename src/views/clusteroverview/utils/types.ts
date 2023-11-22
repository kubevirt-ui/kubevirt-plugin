import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type Descriptor<T = any> = {
  description: string;
  displayName: string;
  path: string;
  value?: any;
  'x-descriptors'?: T[];
};

export type CRDDescription = {
  description?: string;
  displayName: string;
  kind: string;
  name: string;
  resources?: {
    kind: string;
    name?: string;
    version: string;
  }[];
  specDescriptors?: Descriptor[];
  statusDescriptors?: Descriptor[];
  version: string;
};

export type APIServiceDefinition = {
  containerPort: number;
  deploymentName: string;
  description?: string;
  displayName: string;
  group: string;
  kind: string;
  name: string;
  resources?: {
    kind: string;
    name?: string;
    version: string;
  }[];
  specDescriptors?: Descriptor[];
  statusDescriptors?: Descriptor[];
  version: string;
};

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
  data?: { [key: string]: any };
  spec?: {
    [key: string]: any;
  };
  status?: { [key: string]: any };
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
        deployments: { name: string; spec: any }[];
        permissions: {
          rules: { apiGroups: string[]; resources: string[]; verbs: string[] }[];
          serviceAccountName: string;
        }[];
      };
      strategy: 'Deployment';
    };
    installModes: { supported: boolean; type: InstallModeType }[];
    provider?: { name: string };
    replaces?: string;
    version?: string;
  };
  status?: {
    phase: ClusterServiceVersionPhase;
    reason: CSVConditionReason;
    requirementStatus?: RequirementStatus[];
  };
} & K8sResourceKind;

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

export enum K8sResourceConditionStatus {
  False = 'False',
  True = 'True',
  Unknown = 'Unknown',
}

export type K8sResourceCondition = {
  lastTransitionTime?: string;
  message?: string;
  reason?: string;
  status: keyof typeof K8sResourceConditionStatus;
  type: string;
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
    conditions?: K8sResourceCondition[];
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
