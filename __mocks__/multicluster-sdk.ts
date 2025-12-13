const multiclusterSDK = require('@stolostron/multicluster-sdk');

module.exports = {
  FleetWatchK8sResource: multiclusterSDK.FleetWatchK8sResource,
  getFleetK8sAPIPath: () => Promise.resolve('/k8s/kubernetes'),
  useFleetClusterNames: () => [['cluster1', 'cluster2'], true, undefined],
  useFleetK8sAPIPath: () => ['/k8s/kubernetes', true, undefined],
  useFleetK8sWatchResource: () => [undefined, true, undefined],
  useFleetPrometheusPoll: () => [undefined, true, undefined],
  useFleetSearchPoll: () => [undefined, true, undefined, jest.fn()],
  useHubClusterName: () => ['hub', true, undefined],
};
