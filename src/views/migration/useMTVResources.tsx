import { modelToGroupVersionKind, RouteModel } from '@kubevirt-ui/kubevirt-api/console';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { MTV_OPERATOR, MTV_ROUTE_NAME, PackageManifestKind } from './constant';

type UseMTVResourcesType = () => {
  operator: PackageManifestKind;
  mtvLink: string;
  loaded: boolean;
};

const useMTVResources: UseMTVResourcesType = () => {
  const [operators, isOperatorsLoaded] = useK8sWatchResource<PackageManifestKind[]>({
    groupVersionKind: {
      group: 'packages.operators.coreos.com',
      version: 'v1',
      kind: 'PackageManifest',
    },
    namespaced: false,
    isList: true,
  });

  const [route, isRouteLoaded, isRouteError] = useK8sWatchResource<any>({
    groupVersionKind: modelToGroupVersionKind(RouteModel),
    name: MTV_ROUTE_NAME,
  });

  const routeLoaded = isRouteLoaded || isRouteError;

  let mtvLink = route?.spec?.host;

  if (mtvLink && !/^http(s)?:\/\//.test(mtvLink)) {
    mtvLink = 'https://'.concat(route?.spec?.host);
  }

  return {
    loaded: isOperatorsLoaded && routeLoaded,
    operator: operators.find((operator) => operator.metadata.name === MTV_OPERATOR),
    mtvLink,
  };
};

export default useMTVResources;
