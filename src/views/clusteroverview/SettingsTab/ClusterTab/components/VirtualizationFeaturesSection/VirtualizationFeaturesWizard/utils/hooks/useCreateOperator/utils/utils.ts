import { NamespaceModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  ConsoleOperatorConfigModel,
  OperatorGroupModel,
  RoleBindingModel,
  RoleModel,
  SubscriptionModel,
} from '@kubevirt-utils/models';
import { getAPIVersionForModel } from '@kubevirt-utils/resources/shared';
import { getGroupVersionKindForModel } from '@openshift-console/dynamic-plugin-sdk';
import {
  AnnotationParser,
  OLMAnnotation,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/types';
import {
  isArrayOfStrings,
  parseJSONAnnotation,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/utils';
import {
  CONSOLE_OPERATOR_CONFIG_NAME,
  RED_HAT_CATALOG_SOURCE,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/constants';
import {
  InstallModeType,
  InstallPlanApproval,
  K8sResourceKind,
  OperatorGroupKind,
  PackageManifestKind,
  SubscriptionKind,
} from '@overview/utils/types';

export const defaultChannelNameFor = (pkg: PackageManifestKind): string =>
  pkg?.status?.defaultChannel || pkg?.status?.channels?.[0]?.name || '-';

export const isK8sResource = (value: any): value is K8sResourceKind =>
  Boolean(value?.metadata?.name);

export const getSuggestedNamespaceTemplate: AnnotationParser<K8sResourceKind> = (
  annotations,
  options,
) =>
  parseJSONAnnotation<K8sResourceKind>(annotations, OLMAnnotation.SuggestedNamespaceTemplate, {
    validate: isK8sResource,
    ...options,
  });

const getCurrentCSVName = (currentChannel, updateVersion) =>
  currentChannel?.entries?.find((e) => e.version === updateVersion)?.name;

export const installModesFor = (pkg: PackageManifestKind) => (channel: string) =>
  pkg?.status?.channels?.find((ch) => ch.name === channel)?.currentCSVDesc?.installModes || [];
export const supportedInstallModesFor = (pkg: PackageManifestKind, channel: string) =>
  installModesFor(pkg)(channel).filter(({ supported }) => supported);

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

export const getClusterServiceVersionPlugins: AnnotationParser<string[]> = (
  annotations,
  options,
): string[] =>
  parseJSONAnnotation<string[]>(annotations, OLMAnnotation.OperatorPlugins, {
    validate: isArrayOfStrings,
    ...options,
  }) ?? [];

export const isCatalogSourceTrusted = (catalogSource: string): boolean =>
  catalogSource === RED_HAT_CATALOG_SOURCE;

export const getPrometheusRole = (namespace: string) => {
  return {
    apiVersion: `${RoleModel.apiGroup}/${RoleModel.apiVersion}`,
    kind: RoleModel.kind,
    metadata: {
      name: `${namespace}-prometheus`,
      namespace: namespace,
    },
    rules: [
      {
        apiGroups: [''],
        resources: ['services', 'endpoints', 'pods'],
        verbs: ['get', 'list', 'watch'],
      },
    ],
  };
};

export const getPrometheusRoleBinding = (namespace: string) => ({
  apiVersion: `${RoleBindingModel.apiGroup}/${RoleBindingModel.apiVersion}`,
  kind: RoleBindingModel.kind,
  metadata: {
    name: `${namespace}-prometheus`,
    namespace: namespace,
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
    generateName: `${namespace}-`,
    namespace: namespace,
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
  const currentChannel = channels?.find((ch) => ch.name === updateChannelName);

  return {
    apiVersion: getAPIVersionForModel(SubscriptionModel) as SubscriptionKind['apiVersion'],
    kind: 'Subscription',
    metadata: {
      name: packageName,
      namespace: namespace,
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

export const createOperatorWatchedResources = {
  consoleOperatorConfig: {
    groupVersionKind: getGroupVersionKindForModel(ConsoleOperatorConfigModel),
    isList: false,
    name: CONSOLE_OPERATOR_CONFIG_NAME,
  },
  namespaces: {
    groupVersionKind: getGroupVersionKindForModel(NamespaceModel),
    isList: true,
  },
};
