import { useEffect, useState } from 'react';

import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceFileSystem,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useVMISubresourceURL from '@multicluster/hooks/useVMISubresourceURL';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

type UseVMIFilesystems = (
  vmi?: V1VirtualMachineInstance,
) => [V1VirtualMachineInstanceFileSystem[], boolean, Error];

export const useVMIFilesystems: UseVMIFilesystems = (vmi) => {
  const [loaded, setLoaded] = useState(false);
  const [filesystems, setFilesystems] = useState<V1VirtualMachineInstanceFileSystem[]>([]);
  const [error, setError] = useState<Error>(null);
  const [url, urlLoaded] = useVMISubresourceURL(vmi, 'filesystemlist');

  useEffect(() => {
    if (!urlLoaded) return;

    const guestOS = vmi?.status?.guestOSInfo?.id;

    setError(null);
    if (guestOS) {
      (async () => {
        const response = await consoleFetch(url);
        const jsonData = await response.json();
        setFilesystems(jsonData?.items ?? []);
        setLoaded(true);
      })().catch((err) => {
        setError(err);
        setLoaded(true);
      });
    }
    (!vmi || (!guestOS && vmi?.metadata)) && setLoaded(true);
  }, [url, loaded, vmi, urlLoaded]);

  return [filesystems, loaded, error];
};
