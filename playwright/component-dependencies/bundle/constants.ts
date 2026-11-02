/** Console host shared modules (Module Federation). Gallery stubs these — not bundled in the plugin. */
export const CONSOLE_HOST_PACKAGES = [
  '@openshift-console/dynamic-plugin-sdk-webpack',
  'react-redux',
  'redux',
  'redux-thunk',
] as const;

export const OPENSHIFT_SDK_PACKAGE = '@openshift-console/dynamic-plugin-sdk';

export const OPENSHIFT_SDK_INTERNAL_PACKAGE = '@openshift-console/dynamic-plugin-sdk-internal';

export const MULTICLUSTER_SDK_PACKAGE = '@stolostron/multicluster-sdk';

export const CONSOLE_HOST_STUB_FILES: Record<string, string> = {
  '@openshift-console/dynamic-plugin-sdk-webpack': 'openshift-console-sdk-webpack.ts',
  'react-redux': 'react-redux.ts',
  redux: 'redux.ts',
  'redux-thunk': 'redux-thunk.ts',
};

export const OPENSHIFT_SDK_SUBPATH_STUBS: Record<string, string> = {
  'lib/api/common-types': 'openshift-console-sdk-catchall.ts',
  'lib/api/internal-types': 'openshift-console-sdk-catchall.ts',
  'lib/app/components/status/icons': 'openshift-console-sdk-status-icons.tsx',
  'lib/app/components/status/Status': 'openshift-console-sdk-catchall.ts',
  'lib/app/core/reducers/coreSelectors': 'openshift-console-sdk-catchall.ts',
  'lib/app/redux-types': 'openshift-console-sdk-catchall.ts',
  'lib/extensions/actions': 'openshift-console-sdk-catchall.ts',
  'lib/extensions/console-types': 'openshift-console-sdk-catchall.ts',
  'lib/extensions/topology-types': 'openshift-console-sdk-catchall.ts',
  'lib/types': 'openshift-console-sdk-catchall.ts',
  'lib/utils/k8s/k8s': 'openshift-console-sdk-k8s.ts',
  'lib/utils/k8s/ws-factory': 'openshift-console-sdk-ws-factory.ts',
};

export const MULTICLUSTER_SDK_SUBPATH_STUBS: Record<string, string> = {
  'lib/internal/FleetResourceEventStream/utils': 'stolostron-fleet-resource-event-utils.ts',
  'lib/internal/checkAccess': 'stolostron-multicluster-check-access.ts',
};
