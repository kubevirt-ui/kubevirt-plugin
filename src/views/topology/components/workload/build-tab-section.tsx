import React from 'react';

import { BuildConfigData } from '@console/shared';
import {
  AdapterDataType,
  BuildAdapter,
  isBuildAdapter,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk/src';
import { DetailsTabSectionExtensionHook } from '@openshift-console/dynamic-plugin-sdk/src/extensions/topology-details';
import { GraphElement } from '@patternfly/react-topology';

import TopologySideBarTabSection from '../side-bar/TopologySideBarTabSection';

import { BuildOverview } from './BuildOverview';
import ResolveAdapter from './ResolveAdapter';
import { getDataFromAdapter } from './utils';

const BuildTabSection: React.FC<{
  id: string;
  buildAdapter: AdapterDataType<BuildConfigData>;
  extensionsResolved: boolean;
}> = ({ id, buildAdapter, extensionsResolved }) => {
  const [{ data: buildConfigs, loaded: buildConfigsDataLoaded }, setBuildConfigsData] =
    React.useState<{
      data?: BuildConfigData;
      loaded: boolean;
    }>({ loaded: false });
  const handleAdapterResolved = React.useCallback((data) => {
    setBuildConfigsData({ data, loaded: true });
  }, []);

  return buildAdapter ? (
    <TopologySideBarTabSection>
      {extensionsResolved && (
        <ResolveAdapter<BuildConfigData>
          key={id}
          resource={buildAdapter.resource}
          useAdapterHook={buildAdapter.provider}
          onAdapterDataResolved={handleAdapterResolved}
        />
      )}
      {buildConfigsDataLoaded && <BuildOverview buildConfigs={buildConfigs.buildConfigs} />}
    </TopologySideBarTabSection>
  ) : null;
};

export const useBuildsSideBarTabSection: DetailsTabSectionExtensionHook = (
  element: GraphElement,
) => {
  const [buildAdapterExtensions, extensionsResolved] =
    useResolvedExtensions<BuildAdapter>(isBuildAdapter);
  const buildAdapter = React.useMemo(
    () =>
      getDataFromAdapter<AdapterDataType<BuildConfigData>, BuildAdapter>(element, [
        buildAdapterExtensions,
        extensionsResolved,
      ]),
    [buildAdapterExtensions, element, extensionsResolved],
  );
  if (!buildAdapter) {
    return [undefined, true, undefined];
  }
  const section = (
    <BuildTabSection
      id={element.getId()}
      buildAdapter={buildAdapter}
      extensionsResolved={extensionsResolved}
    />
  );
  return [section, true, undefined];
};
