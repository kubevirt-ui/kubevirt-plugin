import { modelToGroupVersionKind, RouteModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  K8sResourceCommon,
  useK8sWatchResources,
  WatchK8sResults,
} from '@openshift-console/dynamic-plugin-sdk';

import { HTTP_REG_EXP, MTV_OPERATOR, MTV_ROUTE_NAME, PackageManifestKind } from '../constants';

const checkResourcesLoaded = (resources: WatchK8sResults<{ [p: string]: K8sResourceCommon[] }>) =>
  Object.keys(resources).length > 0 &&
  Object.values(resources).every((value) => value.loaded || !!value.loadError);

const getMTVLink = (route) => {
  const rawLink = route?.spec?.host;
  return rawLink && !HTTP_REG_EXP.test(rawLink) ? 'https://'.concat(route?.spec?.host) : rawLink;
};

const getMTVOperator = (operators: PackageManifestKind[]) =>
  operators?.find((operator) => operator.metadata.name === MTV_OPERATOR);

const mtvResources = {
  operators: {
    groupVersionKind: {
      group: 'packages.operators.coreos.com',
      version: 'v1',
      kind: 'PackageManifest',
    },
    namespaced: false,
    isList: true,
  },
  route: {
    groupVersionKind: modelToGroupVersionKind(RouteModel),
    name: MTV_ROUTE_NAME,
  },
};

type UseMTVResourcesType = () => {
  mtvLoaded: boolean;
  mtvOperator: PackageManifestKind;
  mtvLink: string;
};

const useMTVResources: UseMTVResourcesType = () => {
  const resources = useK8sWatchResources<{ [key: string]: K8sResourceCommon[] }>(mtvResources);
  const resourcesLoaded = checkResourcesLoaded(resources);

  const mtvOperator = getMTVOperator(resources?.operators?.data as PackageManifestKind[]);
  const mtvLink = getMTVLink(resources?.route?.data);

  return {
    mtvLoaded: resourcesLoaded,
    mtvOperator,
    mtvLink,
  };
};

export default useMTVResources;
