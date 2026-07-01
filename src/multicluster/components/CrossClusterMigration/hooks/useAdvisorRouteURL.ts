import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const MTV_ADVISOR_ROUTE_NAME = 'mtv-advisor-route';
const MTV_ADVISOR_NAMESPACE = 'open-cluster-management';

const PROXY_KUBEVIRT_MTV_ADVISOR = '/api/proxy/plugin/kubevirt-plugin/mtv-advisor';

const RouteGroupVersionKind = {
  group: 'route.openshift.io',
  kind: 'Route',
  version: 'v1',
};

const useAdvisorRouteURL = (): [null | string, boolean, Error] => {
  const [route, loaded, error] = useK8sWatchResource({
    groupVersionKind: RouteGroupVersionKind,
    name: MTV_ADVISOR_ROUTE_NAME,
    namespace: MTV_ADVISOR_NAMESPACE,
  });

  const isAvailable = loaded && !error && !!(route as any)?.spec?.host;

  return [isAvailable ? PROXY_KUBEVIRT_MTV_ADVISOR : null, loaded, error];
};

export default useAdvisorRouteURL;
