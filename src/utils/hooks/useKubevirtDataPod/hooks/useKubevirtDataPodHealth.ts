import { useEffect, useState } from 'react';

import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { signal } from '@preact/signals-core';

import { PROXY_KUBEVIRT_URL, PROXY_KUBEVIRT_URL_HEALTH_PATH } from '../utils/constants';

const healthPromiseSignal = signal<null | Promise<Response>>(null);

const useKubevirtDataPodHealth = (): boolean | null => {
  const [isAlive, setIsAlive] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAlive !== null) return;
    let cancelled = false;

    const healthPromise =
      healthPromiseSignal.value ??
      (healthPromiseSignal.value = consoleFetch(
        `${PROXY_KUBEVIRT_URL}${PROXY_KUBEVIRT_URL_HEALTH_PATH}`,
      ));

    healthPromise
      .then((response: Response): void => {
        if (!cancelled) setIsAlive(response.ok);
      })
      .catch((): void => {
        if (healthPromiseSignal.value === healthPromise) {
          healthPromiseSignal.value = null;
        }
        if (!cancelled) setIsAlive(false);
      });

    return (): void => {
      cancelled = true;
    };
  }, [isAlive]);

  return isAlive;
};
export default useKubevirtDataPodHealth;
