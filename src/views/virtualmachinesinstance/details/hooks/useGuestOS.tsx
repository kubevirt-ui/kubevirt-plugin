import { useEffect, useState } from 'react';

import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isGuestAgentConnected, vmiStatuses } from '@kubevirt-utils/resources/vmi';
import useGuestAgentURL from '@multicluster/hooks/useGuestAgentURL';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

type UseGuestOS = (
  vmi: V1VirtualMachineInstance,
) => [V1VirtualMachineInstanceGuestAgentInfo, boolean, any, boolean];

const useGuestOS: UseGuestOS = (vmi) => {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<V1VirtualMachineInstanceGuestAgentInfo>({});
  const [error, setError] = useState(null);
  const isGuestAgent = isGuestAgentConnected(vmi);
  const [guestAgentURL, guestAgentURLLoaded] = useGuestAgentURL(vmi);

  useEffect(() => {
    if (!guestAgentURLLoaded) return;

    setError(null);

    if (vmi?.status?.phase === vmiStatuses.Running && isGuestAgent) {
      (async () => {
        const response = await consoleFetch(guestAgentURL);
        const jsonData = await response.json();
        setData(jsonData);
        setLoaded(true);
        setError(null);
      })().catch((err) => {
        setError(err);
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
  }, [vmi, isGuestAgent, guestAgentURL, guestAgentURLLoaded]);

  return [data, loaded, error, isGuestAgent];
};

export default useGuestOS;
