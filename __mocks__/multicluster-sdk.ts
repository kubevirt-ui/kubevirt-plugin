const multiclusterSDK = require('@stolostron/multicluster-sdk');

module.exports = {
  FleetWatchK8sResource: multiclusterSDK.FleetWatchK8sResource,
  getFleetK8sAPIPath: () => Promise.resolve('/k8s/kubernetes'),
  useFleetK8sAPIPath: () => ['/k8s/kubernetes', true, undefined],
  useFleetK8sWatchResource: () => [undefined, true, undefined],
  useHubClusterName: () => ['hub', true, undefined],
};
