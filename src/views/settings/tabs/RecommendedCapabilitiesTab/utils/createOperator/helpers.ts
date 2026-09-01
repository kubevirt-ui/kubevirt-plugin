/* eslint-disable */
import { NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  ConsoleOperatorConfigModel,
  OperatorGroupModel,
  RoleBindingModel,
  RoleModel,
  SubscriptionModel,
} from '@kubevirt-utils/models';
import { getAPIVersionForModel } from '@kubevirt-utils/resources/shared';
import { parseJSONAnnotation } from '@kubevirt-utils/utils/utils';
import { getGroupVersionKindForModel, ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';
import {
  InstallModeType,
  InstallPlanApproval,
  K8sResourceKind,
  OperatorGroupKind,
  PackageManifestKind,
  SubscriptionKind,
} from '@overview/utils/types';

import { CONSOLE_OPERATOR_CONFIG_NAME } from '../constants';
import { RED_HAT_CATALOG_SOURCE } from './constants';

export enum OLMAnnotation {
  ActionText = 'marketplace.openshift.io/action-text',
  Capabilities = 'capabilities',
  Categories = 'categories',
  CertifiedLevel = 'certifiedLevel',
  CNF = 'features.operators.openshift.io/cnf',
  CNI = 'features.operators.openshift.io/cni',
  ContainerImage = 'containerImage',
  CreatedAt = 'createdAt',
  CSI = 'features.operators.openshift.io/csi',
  Description = 'description',
  Disconnected = 'features.operators.openshift.io/disconnected',
  DisplayName = 'displayName',
  FIPSCompliant = 'features.operators.openshift.io/fips-compliant',
  HealthIndex = 'healthIndex',
  InfrastructureFeatures = 'operators.openshift.io/infrastructure-features',
  InitializationLink = 'operatorframework.io/initialization-link',
  InitializationResource = 'operatorframework.io/initialization-resource',
  InternalObjects = 'operators.operatorframework.io/internal-objects',
  OperatorPlugins = 'console.openshift.io/plugins',
  OperatorType = 'operators.operatorframework.io/operator-type',
  ProxyAware = 'features.operators.openshift.io/proxy-aware',
  RemoteWorkflow = 'marketplace.openshift.io/remote-workflow',
  Repository = 'repository',
  SuggestedNamespaceTemplate = 'operatorframework.io/suggested-namespace-template',
  Support = 'support',
  SupportWorkflow = 'marketplace.openshift.io/support-workflow',
  Tags = 'tags',
  TLSProfiles = 'features.operators.openshift.io/tls-profiles',
  TokenAuthAWS = 'features.operators.openshift.io/token-auth-aws',
  TokenAuthAzure = 'features.operators.openshift.io/token-auth-azure',
  TokenAuthGCP = 'features.operators.openshift.io/token-auth-gcp',
  UninstallMessage = 'operator.openshift.io/uninstall-message',
  ValidSubscription = 'operators.openshift.io/valid-subscription',
}

type AnnotationParserOptions = {
  onError?: (e: any) => void;
};

export type AnnotationParser<
  Result = any,
  Options extends AnnotationParserOptions = AnnotationParserOptions,
> = (annotations: ObjectMetadata['annotations'], options?: Options) => Result;

export type ParseJSONAnnotationOptions = {
  onError?: (error: any) => void;
  validate?: (value: any) => boolean;
};

export const isArrayOfStrings = (value: any): value is string[] =>
  Array.isArray(value) && !value.some((element) => typeof element !== 'string');

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
    name: namespace,
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

export const getCreateOperatorWatchedResources = (cluster?: string) => ({
  consoleOperatorConfig: {
    cluster,
    groupVersionKind: getGroupVersionKindForModel(ConsoleOperatorConfigModel),
    isList: false,
    name: CONSOLE_OPERATOR_CONFIG_NAME,
  },
  namespaces: {
    cluster,
    groupVersionKind: getGroupVersionKindForModel(NamespaceModel),
    isList: true,
  },
});
