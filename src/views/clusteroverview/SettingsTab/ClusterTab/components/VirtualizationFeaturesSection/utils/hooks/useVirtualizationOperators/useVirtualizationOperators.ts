import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { InstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';

import useOperatorResources from '../useOperatorResources/useOperatorResources';

import { NON_STANDALONE_ANNOTATION_VALUE } from './utils/constants';
import {
  OLMAnnotation,
  OperatorDetailsMap,
  OperatorResources,
  VirtFeatureOperatorItem,
  VirtFeatureOperatorItemsMap,
} from './utils/types';
import {
  clusterServiceVersionFor,
  computeInstallState,
  getOperatorData,
  getPackageSource,
  getPackageUID,
  groupOperatorItems,
  subscriptionFor,
} from './utils/utils';

type UseVirtualizationOperators = () => {
  operatorDetailsMap: OperatorDetailsMap;
  operatorItemsMap: VirtFeatureOperatorItemsMap;
  operatorResources: OperatorResources;
  operatorResourcesLoaded: boolean;
};

const useVirtualizationOperators: UseVirtualizationOperators = () => {
  const resources = useOperatorResources();
  const {
    clusterServiceVersions,
    filteredPackageManifests,
    operatorGroups,
    operatorResourcesLoaded,
    subscriptions,
  } = resources;

  const virtFeatureOperatorItems: VirtFeatureOperatorItem[] = filteredPackageManifests
    .filter((pkg) => {
      const { channels, defaultChannel } = pkg.status ?? {};
      // if a package does not have status.defaultChannel, exclude it so the app doesn't fail
      if (!defaultChannel) {
        kubevirtConsole.warn(
          `PackageManifest ${getName(pkg)} has no status.defaultChannel and has been excluded`,
        );
        return false;
      }

      const { currentCSVDesc } = channels.find((ch) => ch.name === defaultChannel);
      // if CSV contains annotation for a non-standalone operator, filter it out
      return !(
        currentCSVDesc.annotations?.[OLMAnnotation.OperatorType] === NON_STANDALONE_ANNOTATION_VALUE
      );
    })
    .map((pkg) => {
      const subscription =
        operatorResourcesLoaded && subscriptionFor(subscriptions, operatorGroups, pkg);
      const clusterServiceVersion =
        operatorResourcesLoaded &&
        clusterServiceVersionFor(clusterServiceVersions, subscription?.status?.installedCSV);
      const { channels, defaultChannel } = pkg.status ?? {};
      const { currentCSVDesc } = (channels || []).find(({ name }) => name === defaultChannel);

      const installState = operatorResourcesLoaded
        ? computeInstallState(clusterServiceVersion, subscription)
        : InstallState.UNKNOWN;

      return {
        installState,
        name: currentCSVDesc?.displayName ?? getName(pkg),
        obj: pkg,
        source: getPackageSource(pkg),
        subscription,
        uid: getPackageUID(pkg),
        version: currentCSVDesc?.version,
      };
    });

  const operatorResources = {
    clusterServiceVersions,
    operatorGroups,
    subscriptions,
  };

  const operatorItemsMap = groupOperatorItems(virtFeatureOperatorItems);
  const operatorDetailsMap = getOperatorData(operatorItemsMap);

  return { operatorDetailsMap, operatorItemsMap, operatorResources, operatorResourcesLoaded };
};

export default useVirtualizationOperators;
