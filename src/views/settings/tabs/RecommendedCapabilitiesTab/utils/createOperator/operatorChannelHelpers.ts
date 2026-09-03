// Extracted from helpers.ts
// Root: src/views/settings/tabs/RecommendedCapabilitiesTab/utils/createOperator/helpers.ts

import {
  OperatorGroupModel,
  RoleBindingModel,
  RoleModel,
  SubscriptionModel,
} from '@kubevirt-utils/models';
import { getAPIVersionForModel } from '@kubevirt-utils/resources/shared';
import {
  InstallModeType,
  type InstallPlanApproval,
  type K8sResourceKind,
  type OperatorGroupKind,
  type PackageManifestKind,
  type SubscriptionKind,
} from '@overview/utils/types';

type PackageChannel = PackageManifestKind['status']['channels'][number];
type InstallMode = PackageChannel['currentCSVDesc']['installModes'][number];

export const defaultChannelNameFor = (pkg: PackageManifestKind): string =>
  pkg?.status?.defaultChannel ?? pkg?.status?.channels?.[0]?.name ?? '-';

const getCurrentCSVName = (
  currentChannel: PackageChannel | undefined,
  updateVersion: string,
): string | undefined => currentChannel?.entries?.find((e) => e.version === updateVersion)?.name;

export const installModesFor =
  (pkg: PackageManifestKind): ((channel: string) => InstallMode[]) =>
  (channel: string): InstallMode[] =>
    pkg?.status?.channels?.find((channelItem) => channelItem.name === channel)?.currentCSVDesc
      ?.installModes ?? [];

export const supportedInstallModesFor = (
  pkg: PackageManifestKind,
  channel: string,
): InstallMode[] => installModesFor(pkg)(channel).filter(({ supported }) => supported);

export const getDefaultInstallMode = (
  packageManifest: PackageManifestKind,
  updateChannelName: string,
): InstallModeType =>
  supportedInstallModesFor(packageManifest, updateChannelName).reduce(
    (preferredInstallMode, mode) =>
      mode.type === InstallModeType.InstallModeTypeAllNamespaces
        ? InstallModeType.InstallModeTypeAllNamespaces
        : preferredInstallMode,
    InstallModeType.InstallModeTypeOwnNamespace,
  );

type PrometheusRoleRule = {
  apiGroups: string[];
  resources: string[];
  verbs: string[];
};

type PrometheusRole = K8sResourceKind & {
  rules: PrometheusRoleRule[];
};

type PrometheusRoleBinding = K8sResourceKind & {
  roleRef: {
    apiGroup: string;
    kind: string;
    name: string;
  };
  subjects: {
    kind: string;
    name: string;
    namespace: string;
  }[];
};

export const getPrometheusRole = (namespace: string): PrometheusRole => ({
  apiVersion: `${RoleModel.apiGroup}/${RoleModel.apiVersion}`,
  kind: RoleModel.kind,
  metadata: {
    name: `${namespace}-prometheus`,
    namespace,
  },
  rules: [
    {
      apiGroups: [''],
      resources: ['services', 'endpoints', 'pods'],
      verbs: ['get', 'list', 'watch'],
    },
  ],
});

export const getPrometheusRoleBinding = (namespace: string): PrometheusRoleBinding => ({
  apiVersion: `${RoleBindingModel.apiGroup}/${RoleBindingModel.apiVersion}`,
  kind: RoleBindingModel.kind,
  metadata: {
    name: `${namespace}-prometheus`,
    namespace,
  },
  roleRef: {
    apiGroup: RoleBindingModel.apiGroup,
    kind: 'Role',
    name: `${namespace}-prometheus`,
  },
  subjects: [
    {
      kind: 'ServiceAccount',
      name: 'prometheus-k8s',
      namespace: 'openshift-monitoring',
    },
  ],
});

export const getOperatorGroup = (
  namespace: string,
  installMode: InstallModeType,
): OperatorGroupKind => ({
  apiVersion: getAPIVersionForModel(OperatorGroupModel) as OperatorGroupKind['apiVersion'],
  kind: 'OperatorGroup',
  metadata: {
    name: namespace,
    namespace,
  },
  ...(installMode === InstallModeType.InstallModeTypeAllNamespaces
    ? {}
    : {
        spec: {
          targetNamespaces: [namespace],
        },
      }),
});

export const getSubscription = (
  namespace: string,
  packageManifest: PackageManifestKind,
  updateChannelName: string,
  updateVersion: string,
  approval: InstallPlanApproval,
): SubscriptionKind => {
  const {
    catalogSource,
    catalogSourceNamespace,
    channels = [],
    packageName,
  } = packageManifest?.status ?? {};
  const currentChannel = channels?.find((channelItem) => channelItem.name === updateChannelName);

  return {
    apiVersion: getAPIVersionForModel(SubscriptionModel) as SubscriptionKind['apiVersion'],
    kind: 'Subscription',
    metadata: {
      name: packageName,
      namespace,
    },
    spec: {
      channel: updateChannelName,
      installPlanApproval: approval,
      name: packageName,
      source: catalogSource,
      sourceNamespace: catalogSourceNamespace,
      startingCSV: getCurrentCSVName(currentChannel, updateVersion),
    },
  };
};
