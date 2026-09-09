import isEqual from 'lodash/isEqual';

import {
  ConsoleOperatorConfigModel,
  OperatorGroupModel,
  SubscriptionModel,
} from '@kubevirt-utils/models';
import { getLabels, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  InstallPlanApproval,
  type K8sResourceKind,
  type OperatorGroupKind,
  type SubscriptionKind,
} from '@kubevirt-utils/types/olm';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { RED_HAT } from '../constants';
import { type VirtFeatureOperatorItem } from '../types';

import {
  CLUSTER_MONITORING_ANNOTATION_KEY,
  OPERATOR_MONITORING_DEFAULT_ANNOTATION_KEY,
  SUGGESTED_NAMESPACE_ANNOTATION_KEY,
} from './constants';
import {
  ensureOperatorNamespace,
  ignoreConflictOrThrow,
  resolveTargetNamespace,
} from './createOperatorNamespace';
import {
  defaultChannelNameFor,
  getClusterServiceVersionPlugins,
  getDefaultInstallMode,
  getOperatorGroup,
  getSubscription,
  getSuggestedNamespaceTemplate,
  isCatalogSourceTrusted,
} from './helpers';

const getConsolePlugins = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((plugin): plugin is string => typeof plugin === 'string')
    : [];

export const createOperator = async (
  operatorItem: VirtFeatureOperatorItem,
  consoleOperatorConfig: K8sResourceKind,
  canPatchConsoleOperatorConfig: boolean,
  namespaceNames: string[],
  operatorGroups: OperatorGroupKind[],
  subscriptions: SubscriptionKind[],
  cluster?: string,
): Promise<void> => {
  const { obj: packageManifest } = operatorItem;
  const { catalogSource, channels = [] } = packageManifest?.status ?? {};

  const defaultChannel = defaultChannelNameFor(packageManifest);
  const { currentCSVDesc } = channels.find((channel) => channel.name === defaultChannel) ?? {};
  const updateVersion = currentCSVDesc?.version;

  const operatorRequestsMonitoring =
    currentCSVDesc?.annotations?.[CLUSTER_MONITORING_ANNOTATION_KEY] === 'true';
  const enableMonitoring =
    Boolean(getLabels(packageManifest)?.provider?.includes(RED_HAT)) &&
    currentCSVDesc?.annotations?.[OPERATOR_MONITORING_DEFAULT_ANNOTATION_KEY] === 'true';

  const suggestedNamespaceAnnotation: unknown =
    currentCSVDesc?.annotations?.[SUGGESTED_NAMESPACE_ANNOTATION_KEY];
  const suggestedNamespace =
    typeof suggestedNamespaceAnnotation === 'string' ? suggestedNamespaceAnnotation : undefined;
  const suggestedNamespaceTemplate =
    getSuggestedNamespaceTemplate(currentCSVDesc?.annotations, {
      onError: (): void => kubevirtConsole.error('Could not parse JSON annotation.'),
    }) ?? {};

  const selectedInstallMode = getDefaultInstallMode(packageManifest, defaultChannel);
  const targetNamespace =
    resolveTargetNamespace(
      getName(suggestedNamespaceTemplate),
      suggestedNamespace,
      selectedInstallMode,
    ) ?? '';

  const operatorGroup = getOperatorGroup(targetNamespace, selectedInstallMode);
  const subscription = getSubscription(
    targetNamespace,
    packageManifest,
    defaultChannel,
    updateVersion,
    InstallPlanApproval.Automatic,
  );
  const csvPlugins = getClusterServiceVersionPlugins(currentCSVDesc?.annotations);
  const enabledPlugins = isCatalogSourceTrusted(catalogSource) ? csvPlugins : [];
  const namespaceExists = namespaceNames.includes(targetNamespace);
  const operatorGroupExists = operatorGroups?.some(
    (group) => getNamespace(group) === targetNamespace,
  );
  const subscriptionExists = subscriptions?.some(
    (sub) => getName(sub) === getName(packageManifest),
  );

  try {
    await ensureOperatorNamespace({
      cluster,
      enableMonitoring,
      namespaceExists,
      operatorRequestsMonitoring,
      suggestedNamespaceTemplate,
      targetNamespace,
    });

    if (!operatorGroupExists) {
      await kubevirtK8sCreate({ cluster, data: operatorGroup, model: OperatorGroupModel }).catch(
        (err: { code?: number; reason?: string }): void => {
          ignoreConflictOrThrow(err, 'Error creating operator group: ');
        },
      );
    }

    if (!subscriptionExists) {
      await kubevirtK8sCreate({ cluster, data: subscription, model: SubscriptionModel }).catch(
        (err: { code?: number; reason?: string }): void => {
          ignoreConflictOrThrow(err, 'Error creating subscription: ');
        },
      );
    }

    const previousPlugins = getConsolePlugins(consoleOperatorConfig?.spec?.plugins);
    const updatedPlugins: string[] = [
      ...previousPlugins.filter((plugin: string) => !csvPlugins.includes(plugin)),
      ...enabledPlugins,
    ];
    const sortedPreviousPlugins = previousPlugins.toSorted((first, second) =>
      first.localeCompare(second),
    );
    const sortedUpdatedPlugins = updatedPlugins.toSorted((first, second) =>
      first.localeCompare(second),
    );
    if (!isEqual(sortedPreviousPlugins, sortedUpdatedPlugins) && canPatchConsoleOperatorConfig) {
      await kubevirtK8sPatch({
        cluster,
        data: [{ op: 'add', path: '/spec/plugins', value: sortedUpdatedPlugins }],
        model: ConsoleOperatorConfigModel,
        resource: consoleOperatorConfig,
      });
    }
  } catch (err) {
    kubevirtConsole.error('*Error: ', err);
    throw err;
  }
};
