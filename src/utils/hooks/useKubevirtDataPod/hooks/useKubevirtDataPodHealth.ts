import { useEffect, useRef } from 'react';

import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { signal } from '@preact/signals-core';

import { PROXY_KUBEVIRT_URL, PROXY_KUBEVIRT_URL_HEALTH_PATH } from '../utils/constants';

const healthPromiseSignal = signal<Promise<any>>(null);

const useKubevirtDataPodHealth = (): boolean | null => {
  const alive = useRef<boolean>(null);
  useEffect(() => {
    const fetch = async () => {
      if (!healthPromiseSignal.value) {
        healthPromiseSignal.value = consoleFetch(
          `${PROXY_KUBEVIRT_URL}${PROXY_KUBEVIRT_URL_HEALTH_PATH}`,
        );
      }

      try {
        const response = await healthPromiseSignal.value;
        alive.current = response.ok;
      } catch {
        alive.current = false;
      }
    };

    alive.current === null && fetch();
  }, []);

  return alive.current;
};
export default useKubevirtDataPodHealth;
