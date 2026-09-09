import { useEffect, useState } from 'react';

import {
  type V1VirtualMachineInstance,
  type V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useGuestAgentURL from '@multicluster/hooks/useGuestAgentURL';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

type UseGuestOS = (
  vmi?: V1VirtualMachineInstance,
) => [V1VirtualMachineInstanceGuestAgentInfo, boolean, Error | null];

export const useGuestOS: UseGuestOS = (vmi) => {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<V1VirtualMachineInstanceGuestAgentInfo>({});
  const [error, setError] = useState<Error | null>(null);
  const [guestURL, guestURLLoaded] = useGuestAgentURL(vmi);

  useEffect(() => {
    if (!guestURLLoaded) return;

    const guestOS = vmi?.status?.guestOSInfo?.id;

    setError(null);
    if (guestOS) {
      (async (): Promise<void> => {
        const response = await consoleFetch(guestURL);
        const jsonData = (await response.json()) as V1VirtualMachineInstanceGuestAgentInfo;
        setData(jsonData);
        setLoaded(true);
      })().catch((err: Error) => {
        setError(err);
        setLoaded(true);
      });
    }
    (!vmi || (!guestOS && vmi?.metadata)) && setLoaded(true);
  }, [guestURL, loaded, vmi, guestURLLoaded]);

  return [data, loaded, error];
};
