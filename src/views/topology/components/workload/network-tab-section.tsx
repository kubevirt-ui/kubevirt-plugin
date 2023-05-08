import React from 'react';

import {
  DetailsTabSectionExtensionHook,
  isNetworkAdapter,
  K8sResourceCommon,
  NetworkAdapter,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk';
import { GraphElement } from '@patternfly/react-topology';

import TopologySideBarTabSection from '../side-bar/TopologySideBarTabSection';

import { NetworkingOverview } from './NetworkingOverview';
import { getDataFromAdapter } from './utils';

const NetworkTabSection: React.FC<{
  networkAdapter: {
    resource: K8sResourceCommon;
  };
}> = ({ networkAdapter }) => {
  return networkAdapter ? (
    <TopologySideBarTabSection>
      <NetworkingOverview obj={networkAdapter.resource} />
    </TopologySideBarTabSection>
  ) : null;
};

export const useNetworkingSideBarTabSection: DetailsTabSectionExtensionHook = (
  element: GraphElement,
) => {
  const [networkAdapterExtensions, extensionsLoaded] =
    useResolvedExtensions<NetworkAdapter>(isNetworkAdapter);
  const networkAdapter = React.useMemo(
    () =>
      getDataFromAdapter<{ resource: K8sResourceCommon }, NetworkAdapter>(element, [
        networkAdapterExtensions,
        extensionsLoaded,
      ]),
    [element, extensionsLoaded, networkAdapterExtensions],
  );
  if (!networkAdapter) {
    return [undefined, true, undefined];
  }
  const section = <NetworkTabSection networkAdapter={networkAdapter} />;
  return [section, true, undefined];
};
