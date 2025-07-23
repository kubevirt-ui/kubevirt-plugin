import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { NON_STANDALONE_ANNOTATION_VALUE } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useVirtualizationOperators/utils/constants';
import {
  OLMAnnotation,
  OperatorDetailsMap,
  VirtFeatureOperatorItem,
  VirtFeatureOperatorItemsMap,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useVirtualizationOperators/utils/types';
import {
  clusterServiceVersionFor,
  computeInstallState,
  getOperatorData,
  getPackageSource,
  getPackageUID,
  groupOperatorItems,
  subscriptionFor,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useVirtualizationOperators/utils/utils';
import { InstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';

import useOperatorResources from '../useOperatorResources/useOperatorResources';

type UseVirtualizationOperators = () => {
  loaded: boolean;
  operatorDetailsMap: OperatorDetailsMap;
  operatorItemsMap: VirtFeatureOperatorItemsMap;
};

const useVirtualizationOperators: UseVirtualizationOperators = () => {
  const {
    clusterServiceVersions,
    filteredPackageManifests,
    loaded,
    operatorGroups,
    subscriptions,
  } = useOperatorResources();

  const virtFeatureOperatorItems: VirtFeatureOperatorItem[] = filteredPackageManifests
    .filter((pkg) => {
      const { channels, defaultChannel } = pkg.status ?? {};
      // if a package does not have status.defaultChannel, exclude it so the app doesn't fail
      if (!defaultChannel) {
        kubevirtConsole.warn(
          `PackageManifest ${pkg.metadata.name} has no status.defaultChannel and has been excluded`,
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
      const subscription = loaded && subscriptionFor(subscriptions, operatorGroups, pkg);
      const clusterServiceVersion =
        loaded &&
        clusterServiceVersionFor(clusterServiceVersions, subscription?.status?.installedCSV);
      const { channels, defaultChannel } = pkg.status ?? {};
      const { currentCSVDesc } = (channels || []).find(({ name }) => name === defaultChannel);

      const installState = loaded
        ? computeInstallState(clusterServiceVersion, subscription)
        : InstallState.UNKNOWN;

      return {
        installState,
        name: currentCSVDesc?.displayName ?? pkg.metadata.name,
        obj: pkg,
        source: getPackageSource(pkg),
        subscription,
        uid: getPackageUID(pkg),
        version: currentCSVDesc?.version,
      };
    });

  const operatorItemsMap = groupOperatorItems(virtFeatureOperatorItems);
  const operatorDetailsMap = getOperatorData(operatorItemsMap);

  return { loaded, operatorDetailsMap, operatorItemsMap };
};

export default useVirtualizationOperators;
