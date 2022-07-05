import { useUserSettings } from '@openshift-console/dynamic-plugin-sdk-internal';

import { GETTING_STARTED_SHOW_STATE } from '../../../../utils/constants';

const useGettingStartedShowState = (key: string, defaultValue = GETTING_STARTED_SHOW_STATE.SHOW) =>
  useUserSettings<GETTING_STARTED_SHOW_STATE>(key, defaultValue, true);

export default useGettingStartedShowState;
