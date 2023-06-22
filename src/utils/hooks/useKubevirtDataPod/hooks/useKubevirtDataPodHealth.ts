import { useEffect, useRef } from 'react';

import { KUBEVIRT_APISERVER_PROXY } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

import { PROXY_KUBEVIRT_URL, PROXY_KUBEVIRT_URL_HEALTH_PATH } from '../utils/constants';

const useKubevirtDataPodHealth = (): boolean | null => {
  const alive = useRef(null);
  const { featureEnabled, loading } = useFeatures(KUBEVIRT_APISERVER_PROXY);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await consoleFetch(`${PROXY_KUBEVIRT_URL}${PROXY_KUBEVIRT_URL_HEALTH_PATH}`);
        alive.current = res.ok;
      } catch {
        alive.current = false;
      }
    };
    alive.current === null && !loading && fetch();
  }, [loading]);

  return alive.current && featureEnabled;
};

export default useKubevirtDataPodHealth;
