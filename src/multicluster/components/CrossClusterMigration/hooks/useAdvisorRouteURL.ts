import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

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

const useAdvisorRouteURL = (): [null | string, boolean, Error] => {
  const [acmPlugin, acmLoaded, acmError] = useK8sWatchResource({
    groupVersionKind: ConsolePluginGroupVersionKind,
    name: ACM_CONSOLE_PLUGIN_NAME,
  });

  const acmNamespace = (acmPlugin as any)?.spec?.backend?.service?.namespace;

  const [route, routeLoaded, routeError] = useK8sWatchResource(
    acmNamespace
      ? {
          groupVersionKind: RouteGroupVersionKind,
          name: MTV_ADVISOR_ROUTE_NAME,
          namespace: acmNamespace,
        }
      : null,
  );

  const loaded = acmLoaded && routeLoaded;
  const error = acmError || routeError;
  const isAvailable = loaded && !error && !!(route as any)?.spec?.host;

  return [isAvailable ? PROXY_KUBEVIRT_MTV_ADVISOR : null, loaded, error];
};

export default useAdvisorRouteURL;
