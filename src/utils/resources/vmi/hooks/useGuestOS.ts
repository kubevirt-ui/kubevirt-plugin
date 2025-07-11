import { useEffect, useState } from 'react';

import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import useGuestAgentURL from '@multicluster/hooks/useGuestAgentURL';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

type UseGuestOS = (
  vmi?: V1VirtualMachineInstance,
) => [V1VirtualMachineInstanceGuestAgentInfo, boolean, Error];

export const useGuestOS: UseGuestOS = (vmi) => {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<V1VirtualMachineInstanceGuestAgentInfo>({});
  const [error, setError] = useState(null);
  const [guestURL, guestURLLoaded] = useGuestAgentURL(vmi);

  useEffect(() => {
    if (!guestURLLoaded) return;

    const guestOS = vmi?.status?.guestOSInfo?.id;

    setError(null);
    if (guestOS) {
      (async () => {
        const response = await consoleFetch(guestURL);
        const jsonData = await response.json();
        setData(jsonData);
        setLoaded(true);
      })().catch((err) => {
        setError(err);
        setLoaded(true);
      });
    }
    (!vmi || (!guestOS && vmi?.metadata)) && setLoaded(true);
  }, [guestURL, loaded, vmi, guestURLLoaded]);

  return [data, loaded, error];
};
