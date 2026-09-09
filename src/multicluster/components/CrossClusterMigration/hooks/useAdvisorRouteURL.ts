import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type ConsolePluginResource = K8sResourceCommon & {
  spec?: {
    backend?: {
      service?: {
        namespace?: string;
      };
    };
  };
};

type RouteResource = K8sResourceCommon & {
  spec?: {
    host?: string;
  };
};

const ACM_CONSOLE_PLUGIN_NAME = 'acm';
const MTV_ADVISOR_ROUTE_NAME = 'mtv-advisor-route';

const PROXY_KUBEVIRT_MTV_ADVISOR = '/api/proxy/plugin/kubevirt-plugin/mtv-advisor';

const ConsolePluginGroupVersionKind = {
  group: 'console.openshift.io',
  kind: 'ConsolePlugin',
  version: 'v1',
};

const RouteGroupVersionKind = {
  group: 'route.openshift.io',
  kind: 'Route',
  version: 'v1',
};

const useAdvisorRouteURL = (): [null | string, boolean, Error | undefined] => {
  const [acmPlugin, acmLoaded, acmError] = useK8sWatchData<ConsolePluginResource>({
    groupVersionKind: ConsolePluginGroupVersionKind,
    name: ACM_CONSOLE_PLUGIN_NAME,
  });

  const acmNamespace = acmPlugin?.spec?.backend?.service?.namespace;

  const [route, routeLoaded, routeError] = useK8sWatchData<RouteResource>(
    acmNamespace
      ? {
          groupVersionKind: RouteGroupVersionKind,
          name: MTV_ADVISOR_ROUTE_NAME,
          namespace: acmNamespace,
        }
      : null,
  );

  const loaded = acmLoaded && routeLoaded;
  const error = acmError ?? routeError;
  const isAvailable = loaded && !error && !!route?.spec?.host;

  return [isAvailable ? PROXY_KUBEVIRT_MTV_ADVISOR : null, loaded, error];
};

export default useAdvisorRouteURL;
