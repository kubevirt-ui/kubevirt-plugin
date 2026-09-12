import { modelToGroupVersionKind, RouteModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type RouteResource } from '@kubevirt-utils/resources/route/types';
import {
  type K8sResourceCommon,
  useK8sWatchResources,
  type WatchK8sResults,
} from '@openshift-console/dynamic-plugin-sdk';

import { HTTP_REG_EXP, MTV_OPERATOR, MTV_ROUTE_NAME, type PackageManifestKind } from '../constants';

const checkResourcesLoaded = (
  resources: WatchK8sResults<{ [p: string]: K8sResourceCommon[] }>,
): boolean =>
  Object.keys(resources).length > 0 &&
  Object.values(resources).every((value) => value.loaded || !!value.loadError);

const getMTVLink = (route: RouteResource | undefined): string | undefined => {
  const rawLink = route?.spec?.host;
  return rawLink && !HTTP_REG_EXP.test(rawLink) ? `https://${rawLink}` : rawLink;
};

const getMTVOperator = (
  operators: PackageManifestKind[] | undefined,
): PackageManifestKind | undefined =>
  operators?.find((operator) => operator.metadata.name === MTV_OPERATOR);

const mtvResources = {
  operators: {
    groupVersionKind: {
      group: 'packages.operators.coreos.com',
      kind: 'PackageManifest',
      version: 'v1',
    },
    isList: true,
    namespaced: false,
  },
  route: {
    groupVersionKind: modelToGroupVersionKind(RouteModel),
    name: MTV_ROUTE_NAME,
  },
};

type UseMTVResourcesReturn = {
  mtvLink: string | undefined;
  mtvLoaded: boolean;
  mtvOperator: PackageManifestKind | undefined;
};

const useMTVResources = (): UseMTVResourcesReturn => {
  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(mtvResources);
  const resourcesLoaded = checkResourcesLoaded(resources);

  const mtvOperator = getMTVOperator(resources?.operators?.data as PackageManifestKind[]);
  const mtvLink = getMTVLink(resources?.route?.data as RouteResource);

  return {
    mtvLink,
    mtvLoaded: resourcesLoaded,
    mtvOperator,
  };
};

export default useMTVResources;
