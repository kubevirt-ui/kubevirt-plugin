import { useEffect, useState } from 'react';

import {
  type V1VirtualMachineInstance,
  type V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isGuestAgentConnected, vmiStatuses } from '@kubevirt-utils/resources/vmi';
import useGuestAgentURL from '@multicluster/hooks/useGuestAgentURL';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

type UseGuestOS = (
  vmi: V1VirtualMachineInstance,
) => [V1VirtualMachineInstanceGuestAgentInfo, boolean, Error | null, boolean];

const isGuestAgentInfo = (value: unknown): value is V1VirtualMachineInstanceGuestAgentInfo =>
  typeof value === 'object' && value !== null;

const useGuestOS: UseGuestOS = (vmi) => {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<V1VirtualMachineInstanceGuestAgentInfo>({});
  const [error, setError] = useState<Error | null>(null);
  const isGuestAgent = isGuestAgentConnected(vmi);
  const [guestAgentURL, guestAgentURLLoaded] = useGuestAgentURL(vmi);

  useEffect(() => {
    if (!guestAgentURLLoaded) return;

    setError(null);

    if (vmi?.status?.phase === vmiStatuses.Running && isGuestAgent) {
      void (async (): Promise<void> => {
        const response = await consoleFetch(guestAgentURL);
        const rawData: unknown = await response.json();
        setData(isGuestAgentInfo(rawData) ? rawData : {});
        setLoaded(true);
        setError(null);
      })().catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
  }, [vmi, isGuestAgent, guestAgentURL, guestAgentURLLoaded]);

  return [data, loaded, error, isGuestAgent];
};

export default useGuestOS;
