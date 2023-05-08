import { useUserSettings } from '@openshift-console/dynamic-plugin-sdk-internal';

const PREFERRED_TOPOLOGY_VIEW_USER_SETTING_KEY = 'topology.preferredView';

export const usePreferredTopologyView = (): [string, boolean] => {
  const [preferredTopologyView, , preferredTopologyViewLoaded] = useUserSettings<string>(
    PREFERRED_TOPOLOGY_VIEW_USER_SETTING_KEY,
  );
  return [preferredTopologyView, preferredTopologyViewLoaded];
};
