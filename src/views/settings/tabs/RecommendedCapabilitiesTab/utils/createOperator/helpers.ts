import { NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { ConsoleOperatorConfigModel } from '@kubevirt-utils/models';
import { parseJSONAnnotation } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForModel,
  type K8sGroupVersionKind,
  type ObjectMetadata,
} from '@openshift-console/dynamic-plugin-sdk';
import { type K8sResourceKind } from '@overview/utils/types';

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
  onError?: (error: unknown) => void;
};

export type AnnotationParser<
  Result = unknown,
  Options extends AnnotationParserOptions = AnnotationParserOptions,
> = (annotations: ObjectMetadata['annotations'], options?: Options) => Result;

export type ParseJSONAnnotationOptions = {
  onError?: (error: unknown) => void;
  validate?: (value: unknown) => boolean;
};

export const isArrayOfStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && !value.some((element) => typeof element !== 'string');

export const isK8sResource = (value: unknown): value is K8sResourceKind =>
  Boolean((value as K8sResourceKind)?.metadata?.name);

export const getSuggestedNamespaceTemplate: AnnotationParser<K8sResourceKind> = (
  annotations,
  options,
): K8sResourceKind =>
  parseJSONAnnotation<K8sResourceKind>(annotations, OLMAnnotation.SuggestedNamespaceTemplate, {
    validate: isK8sResource,
    ...options,
  });

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

type CreateOperatorWatchedResources = {
  consoleOperatorConfig: {
    cluster?: string;
    groupVersionKind: K8sGroupVersionKind;
    isList: false;
    name: string;
  };
  namespaces: {
    cluster?: string;
    groupVersionKind: K8sGroupVersionKind;
    isList: true;
  };
};

export const getCreateOperatorWatchedResources = (
  cluster?: string,
): CreateOperatorWatchedResources => ({
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

export {
  defaultChannelNameFor,
  getDefaultInstallMode,
  getOperatorGroup,
  getPrometheusRole,
  getPrometheusRoleBinding,
  getSubscription,
  installModesFor,
  supportedInstallModesFor,
} from './operatorChannelHelpers';
