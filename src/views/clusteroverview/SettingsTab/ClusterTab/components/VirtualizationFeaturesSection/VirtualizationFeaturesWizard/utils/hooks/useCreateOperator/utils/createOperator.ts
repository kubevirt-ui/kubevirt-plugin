import { defaultsDeep, isEqual } from 'lodash';

import {
  ConsoleOperatorConfigModel,
  NamespaceModel,
  OperatorGroupModel,
  RoleBindingModel,
  RoleModel,
  SubscriptionModel,
} from '@kubevirt-utils/models';
import { getLabels, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { VirtFeatureOperatorItem } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useVirtualizationOperators/utils/types';
import {
  CLUSTER_MONITORING_ANNOTATION_KEY,
  OPENSHIFT_CLUSTER_MONITORING_ANNOTATION_KEY,
  OPERATOR_MONITORING_DEFAULT_ANNOTATION_KEY,
  RED_HAT,
  SUGGESTED_NAMESPACE_ANNOTATION_KEY,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/constants';
import {
  defaultChannelNameFor,
  getClusterServiceVersionPlugins,
  getDefaultInstallMode,
  getOperatorGroup,
  getPrometheusRole,
  getPrometheusRoleBinding,
  getSubscription,
  getSuggestedNamespaceTemplate,
  isCatalogSourceTrusted,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/hooks/useCreateOperator/utils/utils';
import {
  InstallPlanApproval,
  K8sResourceKind,
  OperatorGroupKind,
  SubscriptionKind,
} from '@overview/utils/types';

export const createOperator = async (
  operatorItem: VirtFeatureOperatorItem,
  consoleOperatorConfig: K8sResourceKind,
  canPatchConsoleOperatorConfig: boolean,
  namespaceNames: string[],
  operatorGroups: OperatorGroupKind[],
  subscriptions: SubscriptionKind[],
) => {
  const { obj: packageManifest } = operatorItem;

  const { catalogSource, channels = [] } = packageManifest?.status ?? {};

  const defaultChannel = defaultChannelNameFor(packageManifest);
  const updateChannelName = defaultChannel;
  const { currentCSVDesc } = channels.find((ch) => ch.name === updateChannelName) ?? {};
  const { version: currentLatestVersion } = currentCSVDesc ?? {};
  const updateVersion = currentLatestVersion;

  const operatorRequestsMonitoring =
    currentCSVDesc.annotations?.[CLUSTER_MONITORING_ANNOTATION_KEY] === 'true';
  const enableMonitoring =
    getLabels(packageManifest)?.provider?.includes(RED_HAT) &&
    currentCSVDesc?.annotations?.[OPERATOR_MONITORING_DEFAULT_ANNOTATION_KEY] === 'true';

  const suggestedNamespace = currentCSVDesc?.annotations?.[SUGGESTED_NAMESPACE_ANNOTATION_KEY];
  const suggestedNamespaceTemplate =
    getSuggestedNamespaceTemplate(currentCSVDesc.annotations, {
      onError: () => kubevirtConsole.error('Could not parse JSON annotation.'),
    }) ?? {};
  const suggestedNamespaceTemplateName = getName(suggestedNamespaceTemplate);
  const targetNamespace = suggestedNamespaceTemplateName || suggestedNamespace;

  const approval = InstallPlanApproval.Automatic;
  const selectedInstallMode = getDefaultInstallMode(packageManifest, updateChannelName);

  const defaultNS: K8sResourceCommon = {
    metadata: {
      labels:
        operatorRequestsMonitoring && enableMonitoring
          ? {
              [OPENSHIFT_CLUSTER_MONITORING_ANNOTATION_KEY]: 'true',
            }
          : {},
      name: targetNamespace,
    },
  };

  // Get resources to be created
  const prometheusRole = getPrometheusRole(targetNamespace);
  const prometheusRoleBinding = getPrometheusRoleBinding(targetNamespace);
  const operatorGroup = getOperatorGroup(targetNamespace, selectedInstallMode);
  const subscription = getSubscription(
    targetNamespace,
    packageManifest,
    defaultChannel,
    updateVersion,
    approval,
  );

  const csvPlugins = getClusterServiceVersionPlugins(currentCSVDesc?.annotations);
  const enabledPlugins = isCatalogSourceTrusted(catalogSource) ? csvPlugins : [];

  const ns = defaultsDeep({}, defaultNS, suggestedNamespaceTemplate);

  const namespaceExists = namespaceNames.includes(targetNamespace);
  const operatorGroupExists = operatorGroups?.some(
    (group) => getNamespace(group) === targetNamespace,
  );
  const subscriptionExists = subscriptions?.some(
    (sub) => getName(sub) === getName(packageManifest),
  );

  try {
    if (!namespaceExists) {
      await k8sCreate({ data: ns, model: NamespaceModel }).catch((err) =>
        kubevirtConsole.error('Error: ', err),
      );

      if (operatorRequestsMonitoring && enableMonitoring) {
        await k8sCreate({ data: prometheusRole, model: RoleModel });
        await k8sCreate({ data: prometheusRoleBinding, model: RoleBindingModel });
      }
    }

    if (!operatorGroupExists) {
      await k8sCreate({ data: operatorGroup, model: OperatorGroupModel }).catch((err) =>
        kubevirtConsole.error('Error: ', err),
      );
    }

    if (!subscriptionExists) {
      await k8sCreate({ data: subscription, model: SubscriptionModel }).catch((err) =>
        kubevirtConsole.error('Error: ', err),
      );
    }

    const previousPlugins: string[] = consoleOperatorConfig?.spec?.plugins || [];
    const updatedPlugins: string[] = [
      ...previousPlugins.filter((plugin: string) => !csvPlugins.includes(plugin)),
      ...enabledPlugins,
    ];
    if (!isEqual(previousPlugins.sort(), updatedPlugins.sort()) && canPatchConsoleOperatorConfig) {
      await k8sPatch({
        data: [
          {
            op: 'add',
            path: '/spec/plugins',
            value: updatedPlugins,
          },
        ],
        model: ConsoleOperatorConfigModel,
        resource: consoleOperatorConfig,
      });
    }
  } catch (err) {
    kubevirtConsole.error('*Error: ', err);
  }
};
