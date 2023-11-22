import { useEffect, useRef } from 'react';

import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

import { PROXY_KUBEVIRT_URL, PROXY_KUBEVIRT_URL_HEALTH_PATH } from '../utils/constants';

const useKubevirtDataPodHealth = (): boolean | null => {
  const alive = useRef<boolean>(null);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await consoleFetch(`${PROXY_KUBEVIRT_URL}${PROXY_KUBEVIRT_URL_HEALTH_PATH}`);
        alive.current = res.ok;
      } catch {
        alive.current = false;
      }
    };

    alive.current === null && fetch();
  }, []);

  return alive.current;
};
export default useKubevirtDataPodHealth;
