import { useEffect, useState } from 'react';

import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { signal } from '@preact/signals-core';

import { PROXY_KUBEVIRT_URL, PROXY_KUBEVIRT_URL_HEALTH_PATH } from '../utils/constants';

const healthPromiseSignal = signal<null | Promise<Response>>(null);

const useKubevirtDataPodHealth = (): boolean | null => {
  const [alive, setAlive] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async (): Promise<void> => {
      const promise =
        healthPromiseSignal.value ??
        consoleFetch(`${PROXY_KUBEVIRT_URL}${PROXY_KUBEVIRT_URL_HEALTH_PATH}`);
      healthPromiseSignal.value = promise;

      try {
        const response = await promise;
        setAlive(response.ok);
      } catch {
        setAlive(false);
      }
    };

    void checkHealth();
  }, []);

  return alive;
};

export default useKubevirtDataPodHealth;
